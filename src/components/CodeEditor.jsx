import React , { useState } from 'react'
import Editor from '@monaco-editor/react';
import { evaluateCode } from '../../server/api';  

function CodeEditor() {
  const [code, setCode] = useState('//write here...');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('71'); // Default to Python
  const [isLoading, setIsLoading] = useState(false);

  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const result = await evaluateCode({
        code,
        languageId: language,
        stdin: input
      });

      console.log(result);
      
      setOutput(result.stdout || result.stderr || result.message);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full">
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="71">Python</option>
        <option value="54">C++</option>
        <option value="63">JavaScript</option>
      </select>

      <Editor theme='vs-dark' height="90vh" defaultLanguage={language} defaultValue={code} onChange={(e) => setCode(e)} />;
      
      <textarea className='bg-white'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input"
        rows={3}
        cols={50}
      />

      <button onClick={handleRunCode} disabled={isLoading} className='bg-white m-2 p-1 rounded-lg' >
        {isLoading ? 'Running...' : 'Run Code'}
      </button>

      <pre>{output}</pre>
    </div>
  );
}

export default CodeEditor
