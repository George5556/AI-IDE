import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatPanelProps {
  workspacePath: string | null;
  onFileUpdate: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert AI software engineer.
The user is working in a directory.
When asked to create or modify code, you must format your response using XML-like tags to define files.

Format for creating/updating a file:
<file path="relative/path/to/file.py">
import os
print("Hello world")
</file>

Always provide the complete file content inside the tags. Do not use markdown code blocks inside the file tags, just the raw code.
You can also explain your changes outside of the tags.`;

const ChatPanel: React.FC<ChatPanelProps> = ({ workspacePath, onFileUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseAndWriteFiles = async (content: string) => {
    if (!workspacePath || !(window as any).electron) return;

    const fileRegex = /<file path="([^"]+)">\s*([\s\S]*?)\s*<\/file>/g;
    let match;
    let anyFileWritten = false;

    while ((match = fileRegex.exec(content)) !== null) {
      const relPath = match[1];
      const fileContent = match[2];

      // Basic path sanitization (very basic, for real app need better security against directory traversal)
      if (relPath.includes('..')) continue;

      const absolutePath = workspacePath + '/' + relPath;
      const success = await (window as any).electron.fs.writeFile(absolutePath, fileContent);
      if (success) {
        anyFileWritten = true;
      }
    }

    if (anyFileWritten) {
      onFileUpdate(); // Trigger sidebar refresh
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !workspacePath) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      let settings = { apiKey: '', baseUrl: '', model: '' };
      if ((window as any).electron) {
        settings = await (window as any).electron.settings.get();
      }

      if (!settings.apiKey) {
         setMessages(prev => [...prev, { role: 'assistant', content: "Please set your API key in the settings first." }]);
         setIsLoading(false);
         return;
      }

      // Simple implementation using fetch instead of openai sdk to avoid polyfill issues in renderer
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: userMsg }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      // Parse response for file tags and write them
      await parseAndWriteFiles(aiResponse);

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
         <span className="font-semibold text-gray-300">AI Assistant</span>
         {!workspacePath && <span className="text-xs text-red-400">Open a folder first</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#21262d] text-gray-300' : 'bg-[#161b22] text-neon-blue border border-neon-blue/30 glow-border'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap break-words ${msg.role === 'user' ? 'bg-[#21262d] text-gray-200' : 'bg-[#0d1117] border border-[#30363d] text-gray-300'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-[#161b22] text-neon-blue flex items-center justify-center animate-pulse">
               <Bot size={16} />
             </div>
             <div className="flex items-center text-gray-500">
               <Loader2 className="animate-spin mr-2" size={16} /> AI is thinking...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#30363d] bg-[#0d1117]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={workspacePath ? "Ask AI to code..." : "Open a folder to start"}
            disabled={!workspacePath || isLoading}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-3 pr-10 py-2 text-sm text-white resize-none focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all disabled:opacity-50"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!workspacePath || isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 rounded bg-neon-blue text-black hover:bg-white transition-colors disabled:opacity-50 disabled:bg-gray-600"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
