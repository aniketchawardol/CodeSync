import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, File, Folder, Calendar, Clock } from "lucide-react";

const FileSystem = ({ userRooms, userName }) => {
    const [expandedRooms, setExpandedRooms] = useState({});
    const [expandedFolders, setExpandedFolders] = useState({});
    const navigate = useNavigate();

  // Toggle room expansion
  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };


  // Toggle folder expansion
  const toggleFolderExpand = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Join room
  const joinRoom = (roomId) => {
    navigate(`/editor/${roomId}/${userName}`);
  };

  // Open file in the room
  const openFile = (roomId, filePath) => {
    navigate(`/editor/${roomId}/${userName}`, {
      state: { openFilePath: filePath }
    });
  };

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render a file in the file tree
  const renderFile = (fileObj, fileName, path, depth, roomId) => {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    // Define colors for different file types
    const fileColors = {
      js: "text-yellow-400",
      jsx: "text-blue-400",
      html: "text-orange-400",
      css: "text-purple-400",
      json: "text-green-400",
      md: "text-gray-400",
      default: "text-gray-400"
    };
    
    const fileColor = fileColors[fileExtension] || fileColors.default;
    
    return (
      <div
        key={fullPath}
        className="flex items-center py-1 px-1 hover:bg-gray-700 rounded cursor-pointer text-gray-300 transition-colors duration-150"
        onClick={() => openFile(roomId, fullPath)}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <File size={16} className={`mr-2 ${fileColor}`} />
        <span>{fileName}</span>
      </div>
    );
  };

  // Render a folder in the file tree
  const renderFolder = (folderObj, folderName, path, depth, roomId) => {
    const currentPath = path ? `${path}/${folderName}` : folderName;
    const fullPath = `${roomId}:${currentPath}`;
    const isExpanded = expandedFolders[fullPath] == true; // Default to collapsed
    
    return (
      <div key={fullPath} className="select-none">
        <div 
          className="flex items-center py-1 px-1 hover:bg-gray-700 rounded cursor-pointer text-gray-300 transition-colors duration-150"
          onClick={() => toggleFolderExpand(fullPath)}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <div className="mr-1">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <Folder size={16} className="mr-1 text-blue-400" />
          <span>{folderName}</span>
        </div>
        
        {isExpanded && (
          <div>
            {folderObj.children && Object.entries(folderObj.children).map(([name, item]) => {
              if (item.type === "folder") {
                return renderFolder(item, name, currentPath, depth + 1, roomId);
              } else {
                return renderFile(item, name, currentPath, depth + 1, roomId);
              }
            })}
          </div>
        )}
      </div>
    );
  };

  // Render the entire file tree for a room
  const renderRoomFileTree = (folder, roomId) => {
    if (!folder) return null;
    
    return (
      <div className="ml-4">
        {Object.entries(folder).map(([name, item]) => {
          if (item.type === "folder") {
            return renderFolder(item, name, "", 0, roomId);
          } else {
            return renderFile(item, name, "", 0, roomId);
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-850 text-white w-full max-w-full">
      <div className="max-h-180 overflow-y-auto p-4 overflow-x-hidden">
        {userRooms.map((room) => {
          const isRoomExpanded = expandedRooms[room.roomId] ?? false; // Default expanded
          return (
            <div key={room.roomId} className="mb-4 bg-gray-800 rounded-lg overflow-hidden shadow">
              <div className="flex items-center justify-between p-3 bg-gray-750 border-l-4 border-blue-500">
                <div 
                  className="flex items-center flex-grow cursor-pointer" 
                  onClick={() => toggleRoomExpand(room.roomId)}
                >
                  <div className="mr-2">
                    {isRoomExpanded ? (
                      <ChevronDown size={18} className="text-blue-400" />
                    ) : (
                      <ChevronRight size={18} className="text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{room.roomId}</div>
                    {room.createdAt && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(room.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white p-3 py-2 text-xs rounded  font-medium transition duration-150"
                  onClick={() => joinRoom(room.roomId)}
                >
                  Join Room
                </button>
              </div>
              
              {isRoomExpanded && (
                <div className="p-2 border-t border-gray-700">
                  {renderRoomFileTree(room.folder, room.roomId)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileSystem;