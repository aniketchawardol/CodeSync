import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import LoginButton from "../auth/login";
import LogoutButton from "../auth/logout";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  File,
  Folder,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import FileSystem from "../components/fileSystem"; // Import the FileSystem component

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [userRooms, setUserRooms] = useState([]);
  const [showFileSystem, setShowFileSystem] = useState(false); // Toggle for FileSystem visibility
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      if (!userName.trim()) {
        alert("Please enter a username first!");
        return;
      }

      if (!user || !user.email) {
        throw new Error("User email is undefined");
      }

      const newRoomId = uuidv4();

      // Default folder structure
      const defaultFolder = {
        src: {
          type: "folder",
          children: {
            "index.js": {
              type: "file",
              content: "// Welcome to CodeSathi",
              language: "javascript",
              status: "unchanged",
            },
          },
        },
      };

      // Step 1: Create a new room entry in the database
      const roomResponse = await fetch("https://codesarthi.onrender.com/api/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: newRoomId,
          createdBy: user.email,
          folder: defaultFolder, // Always use default
        }),
      });

      if (!roomResponse.ok) {
        throw new Error("Failed to create room in database");
      }

      // Step 2: Navigate to the room's editor page
      navigate(`/editor/${newRoomId}/${userName}`, {
        state: { folder: defaultFolder },
      });
    } catch (error) {
      console.error("Error creating room: Admin.jsx", error);
      // Handle error (show message to user, etc.)
    }
  };

  const joinRoom = async () => {
    try {
      if (!userName.trim()) {
        alert("Please enter a username first!");
        return;
      }

      if (!roomId.trim()) {
        alert("Enter a valid Room ID!");
        return;
      }
      // Navigate to the editor with the correct folder
      navigate(`/editor/${roomId}/${userName}`);
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join the room. Please check the Room ID and try again.");
    }
  };

  const handleUserLoginOrSignup = async (name, email) => {
    try {
      // Call the backend API
      const response = await fetch("https://codesarthi.onrender.com/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to handle user login/signup");
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error handling user login/signup:", error);
      throw error;
    }
  };

  const fetchUserRooms = async (email) => {
    try {
      // Find all rooms created by this user's email
      const response = await fetch(
        `https://codesarthi.onrender.com/api/room/user/${email}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user rooms");
      }

      const data = await response.json();
      console.log("User's rooms:", data.rooms);
      setUserRooms(data.rooms);
      // If rooms exist, show the file system
      if (data.rooms && data.rooms.length > 0) {
        setShowFileSystem(true);
      }
    } catch (error) {
      console.error("Error fetching user rooms:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      handleUserLoginOrSignup(
        user.given_name || user.name || "User",
        user.email
      )
        .then((result) => {
          console.log(result);
          // Set username from Auth0 user data
          setUserName(user.given_name || user.name || "User");
          // Fetch user rooms after login
          if (user.email) {
            fetchUserRooms(user.email);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-between h-full bg-gray-900 w-full overflow-hidden">
      <div className="m-5 h-100vh w-xl">
        {/* Toggle button for File System */}
        {isAuthenticated && userRooms.length > 0 && (
          <div className="w-full h-full max-w-lg bg-gray-850 rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">My Code Rooms</h2>
            </div>
            <FileSystem userRooms={userRooms} userName={userName} />
          </div>
        )}

        
      </div>

      <div  className="fixed top-50 right-70  flex flex-col justify-center items-center">
        <div className="fixed top-7 right-7">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
        <h1 className=" fixed top-25 text-5xl text-blue-600 font-bold mb-8">CodeSathi</h1>

        <div className="w-full max-w-md mb-8 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-4 py-2 text-white bg-gray-800 border-green-500 rounded-lg border w-full mb-4"
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg w-full mb-4 transition duration-200"
            onClick={createRoom}
          >
            Create New Room
          </button>

          <p className="text-white text-center text-lg mb-4">or</p>

          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="px-4 py-2 text-white bg-gray-800 border-green-500 rounded-l-lg border flex-grow"
            />

            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-r-lg transition duration-200"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
