import "./App.css";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-800">
        <CodeEditor/>
      </div>
    </>
  );
}

export default App;
