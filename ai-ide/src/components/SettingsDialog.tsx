import React, { useState, useEffect } from 'react';

interface SettingsDialogProps {
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');

  useEffect(() => {
    const loadSettings = async () => {
      if ((window as any).electron) {
        const settings = await (window as any).electron.settings.get();
        if (settings) {
          setApiKey(settings.apiKey || '');
          setBaseUrl(settings.baseUrl || 'https://api.openai.com/v1');
          setModel(settings.model || 'gpt-3.5-turbo');
        }
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if ((window as any).electron) {
      await (window as any).electron.settings.set({ apiKey, baseUrl, model });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 w-96 glow-border">
        <h2 className="text-xl font-bold mb-4 text-neon-blue glow-text">AI Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              placeholder="gpt-4-turbo"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#161b22] text-neon-blue border border-neon-blue glow-button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
