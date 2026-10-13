import { useState } from 'react';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import TerminalPanel from './components/TerminalPanel';
import ChatPanel from './components/ChatPanel';
import SettingsDialog from './components/SettingsDialog';
import { Settings } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme] = useState('dark-neon'); // placeholder for theme class

  const handleOpenFolder = async () => {
    if ((window as any).electron) {
      const dirPath = await (window as any).electron.fs.openDirectory();
      if (dirPath) {
        setWorkspacePath(dirPath);
      }
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-background text-gray-300 overflow-hidden ${theme}`}>
      {/* Top Navbar */}
      <div className="h-10 flex items-center justify-between px-4 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-neon-blue tracking-wider glow-text">AI IDE</span>
          <button
            onClick={handleOpenFolder}
            className="text-sm px-3 py-1 bg-[#21262d] hover:bg-[#30363d] rounded text-gray-300 hover:text-white transition-colors"
          >
            Open Folder
          </button>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-[#30363d] rounded transition-colors text-gray-400 hover:text-neon-blue">
          <Settings size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (File Explorer) */}
        <div className="w-64 flex-shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col">
          <Sidebar workspacePath={workspacePath} onSelectFile={setSelectedFile} />
        </div>

        {/* Center Content (Editor + Terminal) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative bg-[#090c10]">
             <EditorPanel selectedFile={selectedFile} />
          </div>
          <div className="h-64 flex-shrink-0 border-t border-[#30363d] bg-[#0d1117]">
             <TerminalPanel />
          </div>
        </div>

        {/* Right Sidebar (AI Chat) */}
        <div className="w-80 flex-shrink-0 border-l border-[#30363d] bg-[#0d1117] flex flex-col">
           <ChatPanel workspacePath={workspacePath} onFileUpdate={() => {
              // Hacky way to trigger file refresh if needed, but chokidar would be better.
           }} />
        </div>
      </div>

      {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default App;
