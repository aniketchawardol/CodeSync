import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, ClipboardCheck } from "lucide-react"; // Icons for copy button

const ChatMessage = ({ message }) => {
  return (
    <div
      className={`p-2 my-1 rounded-lg w-[70%] ${
        message.sender === "user" 
          ? "bg-blue-500/80 text-white float-right" 
          : "bg-white/5 text-white/90 float-left"
      }`}
    >
      <p className="text-sm font-semibold mb-1 text-white/90">
        {message.userName}
      </p>

      <ReactMarkdown
        children={message.text}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            return !inline ? (
              <CodeBlock code={String(children)} {...props} />
            ) : (
              <code className="bg-white/10 text-white/90 p-1 rounded">{children}</code>
            );
          },
        }}
      />
    </div>
  );
};

// CodeBlock Component with Copy Functionality
const CodeBlock = ({ code, ...props }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    <div className="relative group">
      <div className="bg-black/20 rounded-lg p-1">
        <SyntaxHighlighter 
          style={dracula} 
          language="javascript" 
          {...props}
          customStyle={{
            background: 'transparent',
            padding: '1rem'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-white/10 text-white/90 p-1 rounded hover:bg-white/20 transition-all"
      >
        {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
      </button>
    </div>
  );
};

export default ChatMessage;
