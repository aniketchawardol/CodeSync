import React, { useState, useEffect, useRef } from "react";
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

const FileSystem = ({
  onFileSelect,
  activeFile,
  socket,
  roomId,
  onFileDelete,}) => {
    
  const [expanded, setExpanded] = useState({
    components: true,
    "components/FileSystem": true,
    pages: true,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [files, setFiles] = useState({
    src: {
      type: "folder",
      children: {
        auth: {
          type: "folder",
          children: {},
        },
        components: {
          type: "folder",
          children: {
            FileSystem: {
              type: "folder",
              children: {
                "FileSystem.jsx": {
                  type: "file",
                  content: "// FileSystem component code",
                  language: "javascript",
                  status: "unchanged",
                },
                "sample.js": {
                  type: "file",
                  content: "// Sample JavaScript file",
                  language: "javascript",
                  status: "unchanged",
                },
              },
            },
            "ChatBot.jsx": {
              type: "file",
              content: "// ChatBot component implementation",
              language: "javascript",
              status: "unchanged",
            },
            "ChatMessage.jsx": {
              type: "file",
              content: "// ChatMessage component code",
              language: "javascript",
              status: "unchanged",
            },
            "Chats.jsx": {
              type: "file",
              content: "// Chats component implementation",
              language: "javascript",
              status: "unchanged",
            },
            "fileSystem.jsx": {
              type: "file",
              content: "// fileSystem styles and utilities",
              language: "javascript",
              status: "unchanged",
            },
            "SideMenu.jsx": {
              type: "file",
              content: "// SideMenu component implementation",
              language: "javascript",
              status: "unchanged",
            },
          },
        },
        pages: {
          type: "folder",
          children: {
            "Admin.jsx": {
              type: "file",
              content: "// Admin page implementation",
              language: "javascript",
              status: "unchanged",
            },
            "CodeEditor.jsx": {
              type: "file",
              content: "// CodeEditor page implementation",
              language: "javascript",
              status: "modified",
            },
          },
        },
      },
    },
  });

  const [showAddMenu, setShowAddMenu] = useState(null);
  const [newItemType, setNewItemType] = useState(null);
  const [newItemPath, setNewItemPath] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const newItemInputRef = useRef(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // If collapsing and there's an open menu, close it
    if (!isCollapsed && showAddMenu) {
      setShowAddMenu(null);
    }
  };

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

  const toggleFolder = (path) => {
    setExpanded({
      ...expanded,
      [path]: !expanded[path],
    });
  };

  const handleFileClick = (fileName, filePath, content, language) => {
    onFileSelect(fileName, content, language);

    // Notify other users that this file has been opened
    if (socket) {
      socket.emit("file-opened", {
        roomId,
        fileName,
        content,
        filePath,
      });
    }
  };

  const handleDeleteClick = (e, path, isFolder) => {
    e.stopPropagation(); // Prevent folder toggle or file selection
    e.preventDefault(); // Prevent default browser behavior

    if (
      window.confirm(
        `Are you sure you want to delete this ${isFolder ? "folder" : "file"}?`
      )
    ) {
      // Implement delete functionality
      const pathParts = path.split("/");
      const itemName = pathParts.pop();
      const parentPath = pathParts.join("/");

      // Create a deep copy of the file system
      const newFiles = JSON.parse(JSON.stringify(files));

      // Find the parent folder
      let currentLevel = newFiles;
      for (const part of pathParts) {
        if (currentLevel[part]) {
          currentLevel = currentLevel[part].children;
        } else if (currentLevel.children && currentLevel.children[part]) {
          currentLevel = currentLevel.children[part].children;
        } else {
          console.error("Path not found:", path);
          return;
        }
      }

      // Delete the item
      delete currentLevel[itemName];

      // Update the state
      setFiles(newFiles);

      // Call the onFileDelete prop if it exists
      if (onFileDelete) {
        onFileDelete(path, isFolder);
      }

      // Notify other users via socket if needed
      if (socket) {
        socket.emit("file-deleted", {
          roomId,
          path,
          isFolder,
        });
      }
    }
  };

  const handleAddClick = (e, path) => {
    e.stopPropagation(); // Prevent folder toggle
    e.preventDefault(); // Prevent default browser behavior

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

    // Create a deep copy of the file system
    const newFiles = JSON.parse(JSON.stringify(files));

    // Find the parent folder
    const pathParts = newItemPath.split("/");
    let currentLevel = newFiles;
    for (const part of pathParts) {
      if (currentLevel[part]) {
        currentLevel = currentLevel[part].children;
      } else if (currentLevel.children && currentLevel.children[part]) {
        currentLevel = currentLevel.children[part].children;
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

    // Update the state
    setFiles(newFiles);

    // If it's a folder, expand it
    if (newItemType === "folder") {
      const newPath = newItemPath ? `${newItemPath}/${finalName}` : finalName;
      setExpanded({
        ...expanded,
        [newPath]: true,
      });
    }

    // Notify other users via socket if needed
    if (socket) {
      socket.emit("item-created", {
        roomId,
        path: newItemPath,
        name: finalName,
        type: newItemType,
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

  const renderFileTree = (tree, path = "", level = 0) => {
    return Object.entries(tree).map(([name, item]) => {
      const currentPath = path ? `${path}/${name}` : name;

      if (item.type === "folder") {
        const isExpanded = expanded[currentPath];

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
                {item.children && Object.keys(item.children).length > 0 ? (
                  renderFileTree(item.children, currentPath, level + 1)
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
        const isActive = activeFile === name;

        return (
          <div
            key={currentPath}
            data-path={currentPath}
            className={`flex items-center px-2 py-1 my-1 rounded cursor-pointer hover:bg-gray-700 relative group ${
              isActive ? "bg-gray-700 border-l-2 border-blue-400" : ""
            }`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() =>
              handleFileClick(name, currentPath, item.content, item.language)
            }
          >
            {getFileIcon(name)}
            <span className="ml-2 flex-grow truncate">{name}</span>
            {isActive && <span className="text-xs text-blue-400 mr-1">●</span>}
            {item.status && getStatusIndicator(item.status)}

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

  return (
    <div
      className={`bg-gray-800 text-gray-200 rounded-md p-2 font-sans text-sm h-full overflow-y-auto shadow-md transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-64 min-w-64"
      } flex flex-col relative`}
    >
      <div className="flex justify-between items-center mb-2">
        {!isCollapsed && <h3 className="font-bold">CodeSathi</h3>}
        <div className={`flex gap-2 ${isCollapsed ? "mx-auto" : "ml-auto"}`}>
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
          {renderFileTree(files)}
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
  );
};

export default FileSystem;
