import "./App.css";
import CodeEditor from "./pages/CodeEditor";
import Home from "./pages/Home"
import {Routes, Route} from "react-router-dom";


function App() {
  return (
    <>
      <div className="bg-gray-800">
          <Routes>
            <Route index element={<Home />} />
            <Route path="/editor/:roomId/:userName" element={<CodeEditor/>} />
          </Routes>
      </div>
    </>
  );
  
}

export default App;
