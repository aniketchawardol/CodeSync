import React, { useState } from "react";

const initialFiles = [
  { id: "1", name: "index.js", content: 'console.log("Hello, World!");' },
  { id: "2", name: "style.css", content: "body { background: #222; }" },
  { id: "3", name: "app.py", content: "print('Hello, Python!')" },
];

const FileExplorer = ({ onFileSelect }) => {
  const [files, setFiles] = useState(initialFiles);

  const handleAddFile = () => {
    const fileName = prompt("Enter file name:");
    if (fileName) {
      const newFile = {
        id: Date.now().toString(),
        name: fileName,
        content: "",
      };
      setFiles([...files, newFile]);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-3 w-60 h-full">
      <h3 className="text-xl mb-3">File Explorer</h3>
      <button
        onClick={handleAddFile}
        className="bg-blue-500 p-2 mb-2 rounded w-full hover:bg-blue-700"
      >
        + New File
      </button>
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            onClick={() => onFileSelect(file)}
            className="cursor-pointer p-1 hover:bg-gray-600 rounded"
          >
            📄 {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
