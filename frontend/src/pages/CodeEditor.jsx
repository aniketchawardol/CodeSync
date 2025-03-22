import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import SideMenu from "../components/SideMenu.jsx";
import { evaluateCode } from "../../server/api";
import { io } from "socket.io-client";
import { CODE_SNIPPETS, NumToLang } from "../constants.js";
import { useNavigate, useParams } from "react-router-dom";
import FileSystem from "../components/FileSystem/FileSystem.jsx";

const socket = io("http://localhost:3000");

function CodeEditor() {
  const [code, setCode] = useState(CODE_SNIPPETS[71]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("71"); // Default to Python
  const [isLoading, setIsLoading] = useState(false);
  const { roomId, userName } = useParams();
  const navigate = useNavigate();
  
  // File system state
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileContent, setActiveFileContent] = useState(null);
  const [activeFileLanguage, setActiveFileLanguage] = useState(null);

  // Cursor tracking
  const [cursors, setCursors] = useState({});
  const editorRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-code", (newCode) => {
      setCode(newCode);
    });

    socket.on("file-opened", ({ fileName, content, language }) => {
      // Another user opened a file, update our state
      setActiveFile(fileName);
      setActiveFileContent(content);
      
      // Determine appropriate language setting
      if (language) {
        setActiveFileLanguage(language);
      } else {
        // Guess language by file extension
        if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
          setLanguage("63"); // JavaScript
        } else if (fileName.endsWith(".py")) {
          setLanguage("71"); // Python
        } else if (fileName.endsWith(".cpp") || fileName.endsWith(".h")) {
          setLanguage("54"); // C++
        }
      }
    });

    const cursorTimers = {};
   socket.on("cursor-update", ({ userName: remoteUserName, cursorPosition }) => {
      if (remoteUserName !== userName) {
        setCursors((prev) => ({
          ...prev,
          [remoteUserName]: cursorPosition,
        }));

        if (cursorTimers[remoteUserName]) {
          clearTimeout(cursorTimers[remoteUserName]);
        }

        cursorTimers[remoteUserName] = setTimeout(() => {
          setCursors((prev) => {
            const updatedCursors = { ...prev };
            delete updatedCursors[remoteUserName];
            return updatedCursors;
          });
        }, 5000);
      }
    });

    return () => {
      socket.off("receive-code");
      socket.off("cursor-update");
      socket.off("file-opened");
      Object.values(cursorTimers).forEach(clearTimeout);
    };
  }, [roomId, userName]);

  // Handle file selection from the file system
  const handleFileSelect = (fileName, content, fileLanguage) => {
    setActiveFile(fileName);
    setActiveFileContent(content);
    
    // Set editor language based on file extension
    if (fileLanguage) {
      setActiveFileLanguage(fileLanguage);
    } else if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
      setLanguage("63"); // JavaScript
      setActiveFileLanguage("javascript");
    } else if (fileName.endsWith(".py")) {
      setLanguage("71"); // Python
      setActiveFileLanguage("python");
    } else if (fileName.endsWith(".cpp") || fileName.endsWith(".h")) {
      setLanguage("54"); // C++
      setActiveFileLanguage("cpp");
    }
    
    // Update editor content
    if (editorRef.current) {
      editorRef.current.setValue(content);
    } else {
      setCode(content);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    let isExternalChange = false;

    socket.on("receive-code", (newCode) => {
      if (editorRef.current.getValue() !== newCode) {
        isExternalChange = true;
        editorRef.current.setValue(newCode);
        isExternalChange = false;
      }
    });

    socket.on("file-content-update", ({ fileName, content }) => {
      if (fileName === activeFile && editorRef.current.getValue() !== content) {
        isExternalChange = true;
        editorRef.current.setValue(content);
        isExternalChange = false;
      }
    });

    editor.onDidChangeCursorPosition((e) => {
      if (!isExternalChange) {
        const cursorPosition = {
          line: e.position.lineNumber,
          column: e.position.column,
          top: editor.getTopForLineNumber(e.position.lineNumber),
          left: editor.getOffsetForColumn(
            e.position.lineNumber,
            e.position.column
          ),
        };

        socket.emit("cursor-update", { roomId, userName, cursorPosition });
      }
    });
  };

  // Handle code changes and emit updates
  const handleCodeChange = (value) => {
    setCode(value);
    
    // Update file content if a file is active
    if (activeFile) {
      setActiveFileContent(value);
      
      // Emit file content update
      socket.emit("file-content-update", { 
        roomId, 
        fileName: activeFile, 
        content: value 
      });
    } else {
      // Regular code update
      socket.emit("code-update", { roomId, code: value });
    }
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

  // Get the appropriate language mode for Monaco
  const getEditorLanguage = () => {
    if (activeFile) {
      if (activeFileLanguage) return activeFileLanguage;
      
      // Determine by file extension
      if (activeFile.endsWith(".js") || activeFile.endsWith(".jsx")) {
        return "javascript";
      } else if (activeFile.endsWith(".py")) {
        return "python";
      } else if (activeFile.endsWith(".cpp") || activeFile.endsWith(".h")) {
        return "cpp";
      }
    }
    
    // Fallback to selected language
    return NumToLang[language];
  };

  return (
    <>
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
        <SideMenu userName={userName} socket={socket} roomId={roomId} />
        
        <FileSystem 
          onFileSelect={handleFileSelect} 
          activeFile={activeFile}
          socket={socket}
          roomId={roomId}
        />

        <div className="md:w-3/5 w-fit" style={{ position: "relative" }}>
          <div className="flex items-center mx-5 my-5">
            <select
              className="bg-gray-600 text-black rounded-xl mr-4"
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                const newCode = CODE_SNIPPETS[newLang];
                setLanguage(newLang);
                
                // Only change code if no file is active
                if (!activeFile) {
                  setCode(newCode);
                  socket.emit("code-update", { roomId, code: newCode });
                }
              }}
            >
              <option value="71">Python</option>
              <option value="54">C++</option>
              <option value="63">JavaScript</option>
            </select>
            
            {activeFile && (
              <div className="text-white bg-gray-700 px-3 py-1 rounded-lg flex items-center">
                <span className="mr-2">Active File:</span>
                <span className="font-mono">{activeFile}</span>
              </div>
            )}
          </div>

          <Editor
            theme="vs-dark"
            height="75vh"
            width="100%"
            className="mx-5 rounded-lg"
            language={getEditorLanguage()}
            value={activeFile ? activeFileContent : code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontFamily: "monospace",
              fontSize: 14,
            }}
          />

          {/* Cursor indicators */}
          {Object.entries(cursors).map(([user, position]) => {
            if (user !== userName && editorRef.current) {
              const editor = editorRef.current;
              const editorDomNode = editor.getDomNode();

              if (!editorDomNode) return null;

              const editorRect = editorDomNode.getBoundingClientRect();

              return (
                <div
                  key={user}
                  style={{
                    position: "absolute",
                    top: `${position.top + editorRect.top}px`,
                    left: `${position.left + editorRect.left}px`,
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