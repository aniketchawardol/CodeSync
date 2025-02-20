import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import SideMenu from "../components/SideMenu.jsx";
import { evaluateCode } from "../../server/api";
import { io } from "socket.io-client";
import { CODE_SNIPPETS ,NumToLang} from "../constants.js";
import { useNavigate, useParams } from "react-router-dom";

const socket = io("http://localhost:3000");

function CodeEditor() {
  const [code, setCode] = useState(CODE_SNIPPETS[71]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("71"); // Default to Python
  const [isLoading, setIsLoading] = useState(false);
  const { roomId, userName } = useParams();
  const navigate = useNavigate();

  // Cursor tracking
  const [cursors, setCursors] = useState({}); // { userName: { line, column, top, left } }
  const editorRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", roomId); // Join the correct room

    socket.on("receive-code", (newCode) => {
      setCode(newCode); // Update code when someone else edits
    });

    const cursorTimers = {}; // To track and clear timeouts per user
    // Listen for cursor updates from other users
    socket.on(
      "cursor-update",
      ({ userName: remoteUserName, cursorPosition }) => {
        // Only update if the cursor update is from another user
        if (remoteUserName !== userName) {
          setCursors((prev) => ({
            ...prev,
            [remoteUserName]: cursorPosition,
          }));

          // Clear existing timeout if user moves again
          if (cursorTimers[remoteUserName]) {
            clearTimeout(cursorTimers[remoteUserName]);
          }

          // Set a new timeout to remove cursor after 5s
          cursorTimers[remoteUserName] = setTimeout(() => {
            setCursors((prev) => {
              const updatedCursors = { ...prev };
              delete updatedCursors[remoteUserName];
              return updatedCursors;
            });
          }, 5000); // 5 seconds delay
        }
      }
    );

    return () => {
      socket.off("receive-code");
      socket.off("cursor-update");
          // Clear all timeouts when unmounting
    Object.values(cursorTimers).forEach(clearTimeout);
    };
  }, [roomId, userName]);

  // Update cursor position
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    let isExternalChange = false; // Flag to track if change is external

    // Handle code change from socket (external change)
    socket.on("receive-code", (newCode) => {
      if (editorRef.current.getValue() !== newCode) {
        isExternalChange = true; // Mark the change as external
        editorRef.current.setValue(newCode);
        isExternalChange = false;
      }
    });

    // Handle cursor position change
    editor.onDidChangeCursorPosition((e) => {
      if (!isExternalChange) {
        // Only emit if it's an internal change
        const cursorPosition = {
          line: e.position.lineNumber,
          column: e.position.column,
          top: editor.getTopForLineNumber(e.position.lineNumber),
          left: editor.getOffsetForColumn(
            e.position.lineNumber,
            e.position.column
          ),
        };

        // Emit cursor position to others
        socket.emit("cursor-update", { roomId, userName, cursorPosition });
      }
    });
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const result = await evaluateCode({
        code,
        languageId: language,
        stdin: input,
      });

      setOutput(result.stdout || result.stderr || result.message);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
        
        <SideMenu userName={userName} socket={socket} roomId={roomId}/>

        <div className="md:w-3/5 w-fit" style={{ position: "relative" }}> 
          <select
            className="bg-gray-600 text-black mx-5 my-5 rounded-xl"
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              const newCode = CODE_SNIPPETS[newLang];
              setLanguage(newLang);
              setCode(newCode);
              socket.emit("code-update", { roomId, code: newCode });
            }}
          >
            <option value="71">Python</option>
            <option value="54">C++</option>
            <option value="63">JavaScript</option>
          </select>

          <Editor
            theme="vs-dark"
            height="75vh"
            width="100%"
            className="mx-5 rounded-lg"
            language={NumToLang[language]}
            value={code}
            onChange={(value) => {
              setCode(value);
              socket.emit("code-update", { roomId, code: value });
            }}
            onMount={handleEditorDidMount}
          />

          {/* Cursor indicators */}
          {Object.entries(cursors).map(([user, position]) => {
            if (user !== userName && editorRef.current) {
              const editor = editorRef.current;
              const editorDomNode = editor.getDomNode();

              if (!editorDomNode) return null;

              // Get editor's bounding box relative to the viewport
              const editorRect = editorDomNode.getBoundingClientRect();

              return (
                <div
                  key={user}
                  style={{
                    position: "absolute",
                    top: `${position.top + editorRect.top}px`, // Adjust for editor's position
                    left: `${position.left + editorRect.left}px`, // Adjust for editor's position
                    backgroundColor: "rgba(255, 0, 0, 0.7)",
                    width: "2px",
                    height: "18px",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: "5px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user}
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="md:w-2/5 w-full flex flex-col items-center justify-center mt-5 md:mt-0">
          <textarea
            className="bg-white border border-gray-300 rounded-lg p-2 w-11/12"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Input"
            rows={3}
          />

          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className="bg-blue-500 text-white m-2 p-2 rounded-lg hover:bg-blue-700"
          >
            {isLoading ? "Running..." : "Run Code"}
          </button>

          <textarea
            className="bg-gray-100 border border-gray-300 rounded-lg p-2 mt-4 w-11/12"
            placeholder="Output"
            rows={13}
            id="output"
            value={output}
            readOnly
          ></textarea>

          <div
            className="flex flex-col items-end w-full mr-10"
            onClick={() => {
              socket.disconnect();
              navigate("/");
            }}
          >
            <button className="bg-red-500 p-2 m-2 rounded-lg w-20 text-white">
              Leave
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodeEditor;
