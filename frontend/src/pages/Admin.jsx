import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import LoginButton from "../auth/login";
import LogoutButton from "../auth/logout";
import { useAuth0 } from "@auth0/auth0-react";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4(); // Generate a unique room ID
    navigate(`/editor/${newRoomId}/${userName}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/editor/${roomId}/${userName}`);
    } else {
      alert("Enter a valid Room ID!");
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
      <h1 className="text-white text-2xl font-bold">CodeSync</h1>

      <input
        type="text"
        placeholder="Enter Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="px-4 py-2 text-white border-green-500 rounded-l-lg border w-full"
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full "
        onClick={createRoom}
      >
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
