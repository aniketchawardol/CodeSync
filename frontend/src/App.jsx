import "./App.css";
import CodeEditor from "./pages/CodeEditor";
import Admin from "./pages/Admin";
import {Routes, Route} from "react-router-dom";
import Chatbot from "./components/ChatBot";

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-lvh bg-gray-800">
      
          <Routes>
            <Route index element={<Admin />} />
            <Route path="/editor/:roomId/:userName" element={<CodeEditor />} />
          </Routes>
      </div>
    </>
  );
}

export default App;
