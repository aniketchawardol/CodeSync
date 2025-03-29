import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4} from "uuid";
import LoginButton from "../auth/login"; 
import LogoutButton from "../auth/logout";
import { useAuth0 } from "@auth0/auth0-react";


const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
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
      const roomResponse = await fetch("http://localhost:3000/api/room", {
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
      const response = await fetch("http://localhost:3000/api/user", {
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

  useEffect(() => {
    if (isAuthenticated && user) {
      handleUserLoginOrSignup(user.given_name, user.email)
        .then((result) => console.log(result))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="fixed top-0 right-0 m-4">
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      </div>
      <h1 className="text-white text-2xl font-bold">CodeSathi</h1>

      <input
        type="text"
        placeholder="Enter Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="px-4 py-2 text-white border-green-500 rounded-l-lg border w-full"
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full "
        onClick={createRoom}>
        Create Room
      </button>

      <p className=" text-white text-lg">or</p>

      <div className="flex">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-4 py-2 text-white border-green-500 rounded-l-lg border"
        />

        <button
          className="bg-green-500 text-white px-4 py-2 rounded-r-lg"
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Admin;