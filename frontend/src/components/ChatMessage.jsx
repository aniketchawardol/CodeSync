import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, ClipboardCheck } from "lucide-react"; // Icon for copy button

const ChatMessage = ({ message }) => {
  return (
    <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
      <ReactMarkdown
        children={message.text}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            return !inline ? (
              <CodeBlock code={String(children)} {...props} />
            ) : (
              <code className="bg-gray-300 p-1 rounded">{children}</code>
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
      <SyntaxHighlighter style={dracula} language="javascript" {...props}>
        {code}
      </SyntaxHighlighter>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded hover:bg-gray-600 transition-all"
      >
        {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
      </button>
    </div>
  );
};

export default ChatMessage;
