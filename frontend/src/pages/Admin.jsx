import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Admin = () => {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const createRoom = () => {
        const newRoomId = uuidv4(); // Generate a unique room ID
        navigate(`/editor/${newRoomId}`);
    };

    const joinRoom = () => {
        if (roomId.trim()) {
            navigate(`/editor/${roomId}`);
        } else {
            alert("Enter a valid Room ID!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-white text-2xl font-bold">CodeSync</h1>

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
