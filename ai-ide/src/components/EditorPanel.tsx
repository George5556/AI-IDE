import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface EditorPanelProps {
  selectedFile: string | null;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ selectedFile }) => {
  const [content, setContent] = useState<string>('');
  const [language, setLanguage] = useState<string>('plaintext');
  const [isModified, setIsModified] = useState(false);

  const originalContentRef = useRef<string>('');

  useEffect(() => {
    const loadFile = async () => {
      if (selectedFile && (window as any).electron) {
        const fileContent = await (window as any).electron.fs.readFile(selectedFile);
        if (fileContent !== null) {
          setContent(fileContent);
          originalContentRef.current = fileContent;
          setIsModified(false);

          // Basic language detection
          if (selectedFile.endsWith('.py')) setLanguage('python');
          else if (selectedFile.endsWith('.ts') || selectedFile.endsWith('.tsx')) setLanguage('typescript');
          else if (selectedFile.endsWith('.js') || selectedFile.endsWith('.jsx')) setLanguage('javascript');
          else if (selectedFile.endsWith('.json')) setLanguage('json');
          else if (selectedFile.endsWith('.css')) setLanguage('css');
          else if (selectedFile.endsWith('.html')) setLanguage('html');
          else setLanguage('plaintext');
        }
      }
    };
    loadFile();
  }, [selectedFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsModified(value !== originalContentRef.current);
    }
  };

  const handleSave = async () => {
    if (selectedFile && isModified && (window as any).electron) {
      const success = await (window as any).electron.fs.writeFile(selectedFile, content);
      if (success) {
        setIsModified(false);
        originalContentRef.current = content;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, content, isModified]);

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4 text-[#30363d]">AI IDE</div>
          <div>Select a file to start editing</div>
        </div>
      </div>
    );
  }

  const fileName = selectedFile.split(/[/\\]/).pop();

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Editor Tabs */}
      <div className="flex h-9 bg-[#161b22] border-b border-[#30363d] overflow-x-auto">
        <div className="flex items-center px-4 bg-[#0d1117] border-r border-[#30363d] border-t-2 border-t-neon-blue min-w-[120px]">
          <span className={`text-sm ${isModified ? 'text-neon-pink font-bold' : 'text-gray-300'}`}>
            {fileName} {isModified && '*'}
          </span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={content}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            cursorBlinking: 'smooth',
            cursorWidth: 2,
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
