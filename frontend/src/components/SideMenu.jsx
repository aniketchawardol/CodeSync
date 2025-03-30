import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Chatbot from "./ChatBot";
import Chats from "./Chats";
import { Stars, MessageCircle } from "lucide-react";

function SideMenu({ userName, socket, roomId }) {
  const [clicked, setClicked] = useState(false);
  const [option, setOption] = useState("None");
  const [sidebarWidth, setSidebarWidth] = useState(88 * 4);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState([]);
  const sidebarRef = useRef(null);
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

  function handleClick(e) {
    setClicked((clicked) => {
      return !clicked;
    });

    if (!clicked) {
      setTimeout(() => {
        setOption(e);
      }, 500);
    } else {
      setSidebarWidth(88 * 4);
      setOption("None");
    }
  }

  function handleMouseDown(e) {
    if (!clicked) return;
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(e) {
    const newWidth = e.x;
    if (newWidth > 88 * 4 && newWidth < 660) { // Min and max width
      setSidebarWidth(newWidth);
    }
  }

  function handleMouseUp() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  return (
    <div className="flex flex-col">
      <div
        ref={sidebarRef}
        className={clsx(
          " flex h-full w-16 justify-between border-e bg-white ",
          { "transition-all duration-300": !isResizing }
        )}
        style={clicked ? { width: sidebarWidth } : { width: 64 }}
      >
        <div className="w-16 px-4 py-6 h-svh">
          <span className="grid aspect-square h-10 my-2 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600 cursor-pointer hover:bg-blue-200">
            <img src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-edd0-51f7-879d-a92de18fb442/raw?se=2025-03-30T08%3A18%3A09Z&sp=r&sv=2024-08-04&sr=b&scid=5224cdb7-d1e5-51a9-86a2-9a0c2dcaff5a&skoid=7c382de0-129f-486b-9922-6e4a89c6eb7d&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-03-30T01%3A21%3A59Z&ske=2025-03-31T01%3A21%3A59Z&sks=b&skv=2024-08-04&sig=Dd64RMZqFZVSsyGqUpzBiP30DhmdaPvD9C/upc45zn4%3D" alt="" />
          </span>

          <span
            onClick={(e) => {
              handleClick("AI");
            }}
            className="grid aspect-square h-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600 cursor-pointer hover:bg-blue-200"
            style={option == "AI" ? { backgroundColor: "#8cb4ff" } : null}
          >
            <Stars />
          </span>

          <span
            onClick={() => {
              handleClick("Chat");
            }}
            className="mt-2 grid aspect-square h-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600 cursor-pointer hover:bg-blue-200"
            style={option=="Chat" ? {backgroundColor: "#8cb4ff"} : null}
          >
            <MessageCircle/>
          </span>

          <div className="absolute inset-x-0 bottom-0 w-fit border-t border-gray-100 bg-white">
            <a
              href="#"
              className="flex items-center gap-3 p-2 h-18 hover:bg-gray-50"
            >
              <img
                alt="Profile"
                src="https://imgs.search.brave.com/LDwOkxgcaKvNTB3Vec9RONC9VujRf4rLOs05AS7i0jw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE2/MjY0ODcvcGhvdG8v/ZnVubnkta2l0dGVu/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz05RnR1X3JOUXBm/V2hZa21RenZDMnhf/LXlHS2hvSm16VUJl/bU00QWxhV1l3PQ"
                className="h-10 w-10 rounded-full object-cover"
              />
            </a>
          </div>
        </div>

        <div className="z-10">
          {option === "AI" && <Chatbot wdth={sidebarWidth - 80} />}
        </div>
        <div className="z-10">
          {option === "Chat" && (
            <Chats
              wdth={sidebarWidth - 80}
              userName={userName}
              socket={socket}
              roomId={roomId}
              messages={messages}
              setMessages={setMessages}
            />
          )}
        </div>

        <div
          className="relative top-0 right-0 h-full w-2 cursor-ew-resize bg-gray-300"
          onMouseDown={handleMouseDown}
        ></div>
      </div>
    </div>
  );
}
export default SideMenu;
