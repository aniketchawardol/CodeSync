import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { evaluateCode } from "../../server/api";
import { io } from "socket.io-client";
import { CODE_SNIPPETS } from "../constants.js";

const socket = io("http://localhost:3000");

function CodeEditor() {
  const [code, setCode] = useState(CODE_SNIPPETS[71]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("71"); // Default to Python
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("code", (updatedCode) => {
      setCode(updatedCode);
    });

    return () => {
      socket.off("code");
    };
  }, []);

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
    <div className="h-screen w-full flex flex-col md:flex-row">
      <div className="md:w-3/5 w-full">
        <select
          className="bg-gray-600 text-black mx-5 my-5 rounded-xl"
          value={language}
          onChange={(e) => {
            const newLang = e.target.value;
            const newCode = CODE_SNIPPETS[newLang];
            setLanguage(newLang);
            setCode(newCode);
            socket.emit("code", newCode);
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
          language={language}
          value={code}
          onChange={(value) => {
            setCode(value);
            socket.emit("code", value);
          }}
        />
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
      </div>
    </div>
  );
}

export default CodeEditor;
