import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Chatbot from "./ChatBot";
import Chats from "./Chats";
import { Stars, MessageCircle, Users, Link, Check } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

function SideMenu({ userName, socket, roomId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOption, setActiveOption] = useState("None");
  const [sidebarWidth, setSidebarWidth] = useState(88 * 4);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState([]);
  const sidebarRef = useRef(null);
  const { user } = useAuth0();
  const [profilePic, setProfilePic] = useState(user?.picture);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.picture) {
      setProfilePic(user.picture);
    }
  }, [user?.picture]);

  useEffect(() => {
    socket.on("updateUserList", (userList) => {
      console.log("Setting up updateUserList listener", socket?.id);
      setConnectedUsers(userList);
    });

    return () => {
      socket.off("updateUserList");
    };
  }, [socket, userName]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopied(true);
        // Reset the "Copied!" message after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };


  function handleSectionClick(section) {
    if (activeOption === section) {
      // If clicking the same section, close sidebar
      setIsOpen(false);
      setActiveOption("None");
    } else {
      // If sidebar is closed, open it
      if (!isOpen) {
        setIsOpen(true);
      }
      // Always update the active section
      setActiveOption(section);
    }
  }

  function handleMouseDown(e) {
    if (!isOpen) return;
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(e) {
    const newWidth = e.x;
    if (newWidth > 88 * 4 && newWidth < 660) {
      // Min and max width
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
        className={clsx("flex h-full justify-between backdrop-blur-[2px]", {
          "transition-all duration-300 ease-in-out": !isResizing,
        })}
        style={isOpen ? { width: sidebarWidth } : { width: 64 }}
      >
        <div className="w-16 px-2 py-6 h-svh flex flex-col items-center">
          <span
            title="Logo"
            onClick={() => handleSectionClick("Users")}
            className={clsx(
              "grid aspect-square h-12 my-2 place-content-center rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-xs cursor-pointer",
              activeOption === "Users"
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Users className={clsx(activeOption === "Users" ? "fill-white" : "")} />
          </span>

          <span
            title="AI"
            onClick={() => handleSectionClick("AI")}
            className={clsx(
              "grid aspect-square h-12 place-content-center rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-xs cursor-pointer",
              activeOption === "AI"
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Stars className={clsx("w-5 h-5", activeOption === "AI" ? "fill-white" : "")} />
          </span>

          <span
            title="Chat"
            onClick={() => handleSectionClick("Chat")}
            className={clsx(
              "mt-2 grid aspect-square h-12 place-content-center rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-xs cursor-pointer",
              activeOption === "Chat"
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <MessageCircle className={clsx("w-5 h-5", activeOption === "Chat" ? "fill-white" : "")} />
          </span>

          <span
            className={clsx(
              "bg-white/5 text-white mt-2 absolute bottom-17 grid aspect-square h-12 place-content-center rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-xs cursor-pointer",
            )}
          >
            <button
            title="Copy Room ID"
          onClick={copyToClipboard}
          className="copy-button "
        >
          {copied ? <Check /> : <Link/>}
        </button>
          </span>
          

          <div className="absolute inset-x-0 p-3 bottom-0 w-fit backdrop-blur-[2px]">
            <img
              alt="Profile"
              src={user?.picture}
              className="h-10 w-10 gap-3 rounded-full object-cover ring-1 ring-white/20 shadow-md opacity-80 hover:opacity-100 transition-opacity"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        <div className="z-10">
          {activeOption === "AI" && <Chatbot wdth={sidebarWidth - 80} />}
        </div>
        <div className="z-10">
          {activeOption === "Chat" && (
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

        <div className="z-10">
          {activeOption === "Users" && (
            <div className="p-4 bg-gray-800 text-white h-full w-full">
              <h2 className="text-xl font-bold mb-2">Connected Users</h2>
              <ul>
                {connectedUsers.map((user, index) => (
                  <li key={index} className="py-1">
                    🟢 {user}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className="relative top-0 right-0 h-full w-1 cursor-ew-resize bg-white/5 hover:bg-white/10 transition-colors duration-200"
          onMouseDown={handleMouseDown}
          ></div>
          </div>
    </div>
  );
}
export default SideMenu;