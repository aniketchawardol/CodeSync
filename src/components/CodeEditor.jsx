import React , { useState } from 'react'
import Editor from '@monaco-editor/react';

function CodeEditor() {
 

  return (
    <div className="h-screen w-full">
      return <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />;
    </div>
  );
}

export default CodeEditor
