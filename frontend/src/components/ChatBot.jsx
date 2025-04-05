import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatMessage from "./ChatMessage";

const gemini_api = import.meta.env.VITE_GEMINI_KEY

const Chatbot = ({wdth}) => {
  const [messages, setMessages] = useState([{text: "Hi! how can I help you?", sender: "AI"}]);
  const [input, setInput] = useState("");

  const genAI = new GoogleGenerativeAI(
    gemini_api
  );
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user", userName: "You" },
      ]);
    
      setInput("");
    
      // Handle bot response
      const result = await model.generateContent(input);
      const botResponse = await result.response.text();
    
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, sender: "AI", userName: "AI" },
      ]);
    
      console.log("Updated Messages:", messages);
    }
  };

  return (
    <div className="flex flex-col h-screen backdrop-blur-[2px]" style={{width: wdth}}>
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
          className="flex-1 bg-white/5 text-white/90 border border-white/10 p-2 rounded-lg focus:outline-none focus:border-white/20 placeholder-white/50"
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
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
};

export default Chatbot;
