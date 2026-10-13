import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const TerminalPanel: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);


  useEffect(() => {
    if (!terminalRef.current || xtermRef.current || !(window as any).electron) return;

    // Initialize xterm.js
    const term = new Terminal({
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#00f3ff',
        cursorAccent: '#0d1117',
        selectionBackground: 'rgba(0, 243, 255, 0.3)',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      fontSize: 13,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to Electron PTY
    (window as any).electron.terminal.init(term.cols, term.rows);

    term.onData((data) => {
      (window as any).electron.terminal.write(data);
    });

    const removeListener = (window as any).electron.terminal.onData((data: string) => {
      term.write(data);
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        (window as any).electron.terminal.resize(xtermRef.current.cols, xtermRef.current.rows);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      removeListener();
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      <div className="flex px-4 py-1 border-b border-[#30363d] text-xs font-semibold uppercase tracking-wider text-gray-500">
        Terminal
      </div>
      <div className="flex-1 p-2 overflow-hidden" ref={terminalRef}></div>
    </div>
  );
};

export default TerminalPanel;
