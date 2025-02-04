import "./App.css";
import CodeEditor from "./pages/CodeEditor";
import Admin from "./pages/Admin";
import {Routes, Route} from "react-router-dom";

function App() {
  return (
    <>

      <div className="flex flex-col items-center justify-center w-full h-lvh bg-gray-800">
        

          <Routes>
            <Route index element={<Admin />} />
            <Route path="/editor/:roomId" element={<CodeEditor />} />
          </Routes>

      <div className="flex flex-col items-center justify-center w-full h-lvh bg-gray-800 rounded-lg">
        <CodeEditor/>

      </div>
    </>
  );
}

export default App;
