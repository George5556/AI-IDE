import React, { useState, useEffect } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

interface SidebarProps {
  workspacePath: string | null;
  onSelectFile: (path: string) => void;
}

const FileTreeNode: React.FC<{ node: FileNode; onSelectFile: (path: string) => void; level: number }> = ({ node, onSelectFile, level }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 hover:bg-[#21262d] cursor-pointer text-sm transition-colors group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="w-4 flex justify-center text-gray-500 group-hover:text-neon-blue mr-1">
          {node.isDirectory ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-4" /> // spacer
          )}
        </span>
        <span className="text-gray-400 group-hover:text-neon-blue mr-2">
          {node.isDirectory ? <Folder size={14} /> : <FileCode size={14} />}
        </span>
        <span className="truncate group-hover:text-white">{node.name}</span>
      </div>
      {node.isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} onSelectFile={onSelectFile} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ workspacePath, onSelectFile }) => {
  const [files, setFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      if (workspacePath && (window as any).electron) {
        const result = await (window as any).electron.fs.readDirectory(workspacePath);
        if (result) {
          // Sort folders first, then files
          result.sort((a: FileNode, b: FileNode) => {
             if (a.isDirectory && !b.isDirectory) return -1;
             if (!a.isDirectory && b.isDirectory) return 1;
             return a.name.localeCompare(b.name);
          });
          setFiles(result);
        }
      }
    };
    loadFiles();

    // In a real app we would use chokidar here to watch for changes and reload
    const interval = setInterval(loadFiles, 2000);
    return () => clearInterval(interval);
  }, [workspacePath]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#30363d]">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {!workspacePath && (
          <div className="px-4 text-sm text-gray-500 italic text-center mt-4">
            No folder opened.
          </div>
        )}
        {files.map((node, idx) => (
          <FileTreeNode key={idx} node={node} onSelectFile={onSelectFile} level={0} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
