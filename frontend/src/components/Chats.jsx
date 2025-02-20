import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";

function Chats({ wdth, userName, socket, roomId, messages, setMessages }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleReceiveChat = ({ userName: senderName, text }) => {
        console.log("Received chat:", text, senderName);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text, sender: "other", userName: senderName },
        ]);
    };

    socket.on("receive-chat", handleReceiveChat);

    return () => {
      socket.off("receive-chat", handleReceiveChat);
    };
  }, [socket, userName]);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("chat-send", { roomId, userName, text: input });
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: "user", userName: "You" },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100" style={{ width: wdth }}>
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <div className="p-4 bg-white flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-lg"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chats;
