import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";

function Chats({ wdth, userName, socket, roomId, messages, setMessages }) {
  const [input, setInput] = useState("");

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
    <div className="flex flex-col h-screen backdrop-blur-[2px]" style={{ width: wdth }}>
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-2 rounded-lg ${
              msg.sender === "user"
                ? "bg-blue-500/80 text-white self-end"
                : "bg-white/5 text-white/90 self-start"
            }`}
          >
            <ChatMessage key={index} message={msg} />
          </div>
        ))}
      </div>

      <div className="p-4 backdrop-blur-[2px] flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1 bg-white/5 text-white/90 border border-white/10 p-2 rounded-lg focus:outline-none focus:border-white/20 placeholder-white/50"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-500/80 hover:bg-blue-600/80 text-white p-2 rounded-lg transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chats;
