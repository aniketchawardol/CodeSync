import "./App.css";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-lvh bg-gray-800 rounded-lg">
        <CodeEditor/>
      </div>
    </>
  );
}

export default App;
