import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import SideMenu from "../components/SideMenu.jsx";
import { evaluateCode } from "../../server/api";
import { io } from "socket.io-client";
import { CODE_SNIPPETS, NumToLang } from "../constants.js";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileType,
  Trash2,
  Plus,
  FilePlus,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import isEqual from "lodash.isequal"; // Import lodash for deep comparison

const socket = io("http://localhost:3000");

function CodeEditor() {
  const location = useLocation();

  const [folder, setFolder] = useState(location.state?.folder || null);

  const [activeFile, setActiveFile] = useState(null);
  const [activeFileContent, setActiveFileContent] = useState("");
  const [activeFileLanguage, setActiveFileLanguage] = useState(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cursors, setCursors] = useState({});

  const { roomId, userName } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  //............................States for file system......................................
  const [expanded, setExpanded] = useState({
    src: true,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for file/folder creation
  const [showAddMenu, setShowAddMenu] = useState(null);
  const [newItemType, setNewItemType] = useState(null);
  const [newItemPath, setNewItemPath] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const newItemInputRef = useRef(null);
  const prevFolder = useRef(folder);

  const [isIOSectionCollapsed, setIsIOSectionCollapsed] = useState(false);

  useEffect(() => {
    if (userName) {
      socket.emit("userJoined", userName);
    }
  }, [userName, socket]);

  useEffect(() => {
    if (
      folder &&
      JSON.stringify(folder) !== JSON.stringify(prevFolder.current)
    ) {
      if (socket) {
        // Emit update to server
        socket.emit("update-folder", {
          roomId,
          updatedFolder: folder,
        });
      }
      prevFolder.current = folder; // Store last folder state
    }
  }, [folder, socket]); // Ensure socket is in dependency array

  useEffect(() => {
    // Join room
    socket.emit("join-room", roomId);

    // Define event handlers
    const handleInitializeFolder = (receivedFolder) => {
      console.log("Received folder:", receivedFolder);
      setFolder(receivedFolder);
      prevFolder.current = receivedFolder; // Initialize folder state
    };

    const handleFolderUpdated = (updatedFolder) => {
      if (!isEqual(prevFolder.current, updatedFolder)) {
        setFolder(updatedFolder);

        if (activeFile) {
          const pathParts = activeFile.split("/");

          const getFileContent = (obj, parts) => {
            if (!obj || parts.length === 0) return null;

            const [currentPart, ...remainingParts] = parts;

            // Ensure we are correctly accessing the folder structure
            const currentItem = obj[currentPart];

            if (!currentItem) return null;

            if (remainingParts.length === 0 && currentItem.type === "file") {
              return currentItem;
            } else if (currentItem.type === "folder") {
              return getFileContent(currentItem.children, remainingParts);
            }

            return null;
          };

          // ✅ Start from updatedFolder.src.children
          const updatedFile = getFileContent(updatedFolder, pathParts);
          if (updatedFile) {
            setActiveFileContent(updatedFile.content);
          }
        }
      }
    };

    // Listen for initial folder and updates
    socket.on("initialize-folder", handleInitializeFolder);
    socket.on("folder-updated", handleFolderUpdated);

    // Cleanup on component unmount
    return () => {
      socket.off("initialize-folder", handleInitializeFolder);
      socket.off("folder-updated", handleFolderUpdated);
    };
  }, [roomId, socket]); // Ensure socket is in dependency array

  // Focus on the new item input when it appears
  useEffect(() => {
    if (newItemType && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [newItemType]);

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAddMenu &&
        !event.target.closest(".add-menu") &&
        !event.target.closest(".add-icon")
      ) {
        setShowAddMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddMenu]);

  // UI Interaction handlers
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // If collapsing and there's an open menu, close it
    if (!isCollapsed && showAddMenu) {
      setShowAddMenu(null);
    }
  };

  const toggleFolder = (path) => {
    setExpanded({
      ...expanded,
      [path]: !expanded[path],
    });
  };

  const handleFileClick = (fileName, filePath, content, language) => {
    // Determine language if not provided
    if (!language) {
      const extension = fileName.split(".").pop().toLowerCase();

      if (["js", "jsx", "ts", "tsx"].includes(extension)) {
        language = "javascript";
      } else if (extension === "py") {
        language = "python";
      } else if (["html", "htm"].includes(extension)) {
        language = "html";
      } else if (extension === "css") {
        language = "css";
      }
    }
    setActiveFile(filePath);
    setActiveFileContent(content || "");
    setActiveFileLanguage(language);
  };

  const handleDeleteClick = (e, path, isFolder) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      window.confirm(
        `Are you sure you want to delete this ${isFolder ? "folder" : "file"}?`
      )
    ) {
      const newFiles = JSON.parse(JSON.stringify(folder));

      // Find the parent folder
      const pathParts = path.split("/").filter(Boolean);
      const itemName = pathParts.pop();

      let currentLevel = newFiles;
      for (const part of pathParts) {
        if (currentLevel[part]) {
          currentLevel = currentLevel[part].children;
        } else {
          console.error("Path not found:", path);
          return;
        }
      }

      // Delete the item
      delete currentLevel[itemName];

      setFolder(newFiles);
    }
  };

  const handleAddClick = (e, path) => {
    e.stopPropagation();
    e.preventDefault();

    // Close menu if clicking the same button again (toggle behavior)
    if (showAddMenu === path) {
      setShowAddMenu(null);
    } else {
      setShowAddMenu(path);
    }
  };

  const handleAddMenuItemClick = (type) => {
    setNewItemType(type);
    setNewItemPath(showAddMenu);
    setNewItemName("");
    setShowAddMenu(null);
  };

  const handleCreateNewItem = () => {
    if (!newItemName.trim()) {
      alert("Please enter a name for the new item");
      return;
    }

    // For files, auto-add extension if not provided
    let finalName = newItemName.trim();
    if (newItemType === "file" && !finalName.includes(".")) {
      finalName += ".js"; // Default extension
    }

    const newFiles = JSON.parse(JSON.stringify(folder));

    // Find the parent folder
    const pathParts = newItemPath.split("/").filter(Boolean);
    let currentLevel = newFiles;
    for (const part of pathParts) {
      if (currentLevel[part]) {
        currentLevel = currentLevel[part].children;
      } else {
        console.error("Path not found:", newItemPath);
        return;
      }
    }

    // Check if item with this name already exists
    if (currentLevel[finalName]) {
      alert(`A ${newItemType} with this name already exists`);
      return;
    }

    // Create the new item
    if (newItemType === "folder") {
      currentLevel[finalName] = {
        type: "folder",
        children: {},
      };
    } else {
      // Determine the language based on the file extension
      const extension = finalName.split(".").pop().toLowerCase();
      let language = "plaintext";
      if (["js", "jsx", "ts", "tsx"].includes(extension)) {
        language = "javascript";
      } else if (["html", "htm"].includes(extension)) {
        language = "html";
      } else if (["css"].includes(extension)) {
        language = "css";
      }

      currentLevel[finalName] = {
        type: "file",
        content: `// New ${finalName} file`,
        language,
        status: "new",
      };
    }

    setFolder(newFiles);

    // If it's a folder, expand it
    if (newItemType === "folder") {
      const newPath = newItemPath ? `${newItemPath}/${finalName}` : finalName;
      setExpanded({
        ...expanded,
        [newPath]: true,
      });
    }

    // Reset the form
    setNewItemType(null);
    setNewItemPath(null);
  };

  const handleCancelNewItem = () => {
    setNewItemType(null);
    setNewItemPath(null);
  };

  // Helper functions for rendering
  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".jsx"))
      return <FileCode size={16} className="text-blue-400" />;
    if (fileName.endsWith(".js"))
      return <FileType size={16} className="text-yellow-400" />;
    return <File size={16} className="text-gray-400" />;
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case "unchanged":
        return <span className="text-xs ml-2 text-blue-400">U</span>;
      case "modified":
        return <span className="text-xs ml-2 text-red-400">M</span>;
      case "edited":
        return <span className="text-xs ml-2 text-yellow-400">E</span>;
      case "new":
        return <span className="text-xs ml-2 text-yellow-400">N</span>;
      default:
        return null;
    }
  };

  // UI Components
  const renderAddMenu = (path) => {
    if (showAddMenu !== path) return null;

    return (
      <div
        className="add-menu absolute z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg"
        style={{ position: "fixed" }}
      >
        <div
          className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => handleAddMenuItemClick("file")}
        >
          <FilePlus size={14} />
          <span className="ml-2">New File</span>
        </div>
        <div
          className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => handleAddMenuItemClick("folder")}
        >
          <FolderPlus size={14} />
          <span className="ml-2">New Folder</span>
        </div>
      </div>
    );
  };

  const renderNewItemForm = (path) => {
    if (newItemPath !== path || !newItemType) return null;

    return (
      <div className="flex items-center ml-6 my-1">
        <input
          ref={newItemInputRef}
          type="text"
          className="bg-gray-700 border border-gray-600 rounded text-gray-100 px-2 py-1 text-sm flex-grow mr-1 focus:outline-none focus:border-blue-400"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={`Enter ${newItemType} name`}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateNewItem();
            if (e.key === "Escape") handleCancelNewItem();
          }}
        />
        <div className="flex gap-1">
          <button
            className="bg-green-500 text-gray-900 rounded px-2 py-1 text-xs hover:bg-opacity-90"
            onClick={handleCreateNewItem}
          >
            ✓
          </button>
          <button
            className="bg-red-500 text-gray-900 rounded px-2 py-1 text-xs hover:bg-opacity-90"
            onClick={handleCancelNewItem}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Render file tree
  const renderFileTree = (tree, path = "", level = 0) => {
    if (!tree) return null;

    return Object.entries(tree).map(([name, item]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = item.type === "folder";

      if (isFolder) {
        const isExpanded = expanded[currentPath];
        const children = item.children;

        return (
          <div key={currentPath}>
            <div
              data-path={currentPath}
              className="flex items-center px-2 py-1 my-1 rounded cursor-pointer hover:bg-gray-700 relative group"
              style={{ paddingLeft: `${level * 16}px` }}
              onClick={() => toggleFolder(currentPath)}
            >
              {isExpanded ? (
                <FolderOpen size={16} className="text-green-400" />
              ) : (
                <Folder size={16} className="text-yellow-600" />
              )}
              <span className="ml-2 flex-grow truncate">{name}</span>

              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 ml-2">
                <Plus
                  size={16}
                  className="text-green-400 cursor-pointer add-icon"
                  onClick={(e) => handleAddClick(e, currentPath)}
                />
                <Trash2
                  size={16}
                  className="text-red-400 cursor-pointer"
                  onClick={(e) => handleDeleteClick(e, currentPath, true)}
                />
              </div>

              {/* Render add menu directly inside the folder row */}
              {showAddMenu === currentPath && (
                <div className="absolute right-8 top-full mt-1 z-50">
                  {renderAddMenu(currentPath)}
                </div>
              )}
            </div>

            {renderNewItemForm(currentPath)}

            {isExpanded && (
              <div className="border-l border-dashed border-gray-600 ml-2 pl-2">
                {children && Object.keys(children).length > 0 ? (
                  renderFileTree(children, currentPath, level + 1)
                ) : (
                  <div
                    className="opacity-60 text-xs"
                    style={{ paddingLeft: `${level * 16 + 16}px` }}
                  >
                    Empty folder
                  </div>
                )}
              </div>
            )}
          </div>
        );
      } else {
        // It's a file
        const isActive = activeFile === currentPath;
        const { content, language, status } = item;

        return (
          <div
            key={currentPath}
            data-path={currentPath}
            className={`flex items-center px-2 py-1 my-1 rounded cursor-pointer hover:bg-gray-700 relative group ${
              isActive ? "bg-gray-700 border-l-2 border-blue-400" : ""
            }`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() =>
              handleFileClick(name, currentPath, content, language)
            }
          >
            {getFileIcon(name)}
            <span className="ml-2 flex-grow truncate">{name}</span>
            {isActive && <span className="text-xs text-blue-400 mr-1">●</span>}
            {status && getStatusIndicator(status)}

            <div className="opacity-0 group-hover:opacity-100 ml-2">
              <Trash2
                size={16}
                className="text-red-400 cursor-pointer"
                onClick={(e) => handleDeleteClick(e, currentPath, false)}
              />
            </div>
          </div>
        );
      }
    });
  };

  const handleAddRootItem = (type) => {
    setNewItemType(type);
    setNewItemPath("src");
    setNewItemName("");
  };

  // For collapsed mode actions
  const handleCollapsedAction = (action) => {
    setIsCollapsed(false);
    setTimeout(() => {
      if (action === "file") {
        handleAddRootItem("file");
      } else if (action === "folder") {
        handleAddRootItem("folder");
      }
    }, 300); // Wait for animation to complete
  };

  //.............................................................................................

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
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
    });
  };

  // Handle code changes and emit updates
  const handleCodeChange = (value) => {
    if (!activeFile) return;

    setActiveFileContent(value);

    const updateFileContent = (obj, pathParts) => {
      if (pathParts.length === 0) return obj;

      const currentPart = pathParts[0];
      const remainingParts = pathParts.slice(1);

      if (remainingParts.length === 0) {
        if (obj[currentPart]?.type === "file") {
          return {
            ...obj,
            [currentPart]: { ...obj[currentPart], content: value },
          };
        }
      } else if (obj[currentPart]?.type === "folder") {
        return {
          ...obj,
          [currentPart]: {
            ...obj[currentPart],
            children: updateFileContent(
              obj[currentPart].children,
              remainingParts
            ),
          },
        };
      }

      return obj;
    };

    // Update the folder state safely
    setFolder((prevFolder) => {
      const newFolder = JSON.parse(JSON.stringify(prevFolder)); // Deep clone
      const pathParts = activeFile.split("/").filter(Boolean);

      const updatedFolder = updateFileContent(newFolder, pathParts);

      // Emit the update
      socket.emit("update-folder", { roomId, updatedFolder });

      return updatedFolder;
    });
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const result = await evaluateCode({
        code: activeFile ? activeFileContent : code,
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
  };

  return (
    <>
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
        <SideMenu userName={userName} socket={socket} roomId={roomId} />
        
        {/* FileSystem */}
        <div
          className={`bg-gray-800 text-gray-200 rounded-md p-7 font-sans text-sm h-full overflow-y-auto shadow-md transition-all duration-300 ${
            isCollapsed ? "w-12" : "w-64 min-w-64"
          } flex flex-col relative`}
        >
          <div className="flex justify-between items-center mb-2">
            {!isCollapsed && <h3 className="font-bold">CodeSathi</h3>}
            <div
              className={`flex gap-2 ${isCollapsed ? "mx-auto" : "ml-auto"}`}
            >
              <button
                className="flex items-center justify-center bg-gray-700 rounded p-1 hover:bg-gray-600"
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </button>
            </div>
          </div>

          {!isCollapsed ? (
            <>
              {renderFileTree(folder)}
              {newItemPath === "src" && renderNewItemForm("src")}
            </>
          ) : (
            <div className="flex flex-col items-center mt-4 space-y-4">
              <FilePlus
                size={20}
                className="cursor-pointer text-gray-400 hover:text-gray-200"
                onClick={() => handleCollapsedAction("file")}
                title="New File"
              />
              <FolderPlus
                size={20}
                className="cursor-pointer text-gray-400 hover:text-gray-200"
                onClick={() => handleCollapsedAction("folder")}
                title="New Folder"
              />
            </div>
          )}
        </div>

        {/* Editor Section - Adjusted width calculations */}
        <div
          className={`transition-all duration-300 flex-1 relative ${
            isIOSectionCollapsed ? "md:pr-4" : "md:pr-[420px]"
          }`}
        >
          <div className="flex items-center mx-5 my-5">
            {activeFile && (
              <div className="text-white bg-gray-700 px-3 py-1 rounded-lg flex items-center">
                <span className="mr-2">Active File:</span>
                <span className="font-mono">{activeFile}</span>
              </div>
            )}
          </div>

          <div className="mx-5">
            <Editor
              theme="vs-dark"
              height="75vh"
              width="100%"
              className="rounded-lg"
              language={getEditorLanguage()}
              value={activeFile ? activeFileContent : "Welcome To CodeSathi"}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontFamily: "monospace",
                fontSize: 14,
              }}
            />
          </div>

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

        {/* Input/Output Section - Fixed positioning */}
        <div className="flex h-full fixed right-0 top-0 bottom-0">
          {/* Toggle Button */}
          <button
              onClick={() => setIsIOSectionCollapsed(!isIOSectionCollapsed)}
              className="absolute -left-10 top-3 z-50 w-8 h-8 bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center rounded-l-md shadow-lg"
              title={
                isIOSectionCollapsed ? "Show Input/Output" : "Hide Input/Output"
              }
            >
              {isIOSectionCollapsed ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          {/* Content Section */}
          <div
            className={`bg-gray-800 text-gray-200 rounded-l-md font-sans text-sm h-full shadow-md transition-all duration-300 flex flex-col ${
              isIOSectionCollapsed
                ? "w-0 md:w-0 opacity-0 overflow-hidden"
                : "w-full md:w-[400px] opacity-100"
            }`}
          >
            
            {/* Header */}
            <div className="flex items-center p-3 border-b border-gray-700">
              <h3 className="font-bold text-white">Input/Output</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4  space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Input</label>
                <textarea
                  className="w-full bg-gray-700 border mt-2 border-gray-600 rounded-lg p-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleRunCode}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Running..." : "Run Code"}
              </button>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Output</label>
                <textarea
                  className="w-full bg-gray-700 border mt-2 border-gray-600 rounded-lg p-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="Output will appear here..."
                  rows={13}
                  id="output"
                  value={output}
                  readOnly
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    socket.disconnect();
                    navigate("/");
                  }}
                  className="absolute bottom-10 right-4  bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodeEditor;