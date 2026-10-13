# AI IDE

An AI-powered IDE built with Electron, React, and Monaco Editor.

## Features
- **Dark Neon Blue Theme**: Sleek UI tailored for a modern developer experience.
- **File Explorer**: Browse, open, and edit your project files locally.
- **Monaco Editor**: Powerful code editor with syntax highlighting (VS Code engine).
- **Integrated Terminal**: Fully functional terminal connected to your local shell via \`node-pty\`.
- **AI Agent (Chat)**: Connect to any OpenAI-compatible API to generate or modify code. The AI can write and update files directly to your disk!

## Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run in development mode:**
   \`\`\`bash
   npm run dev:full
   \`\`\`
   *(This starts both the Vite dev server and the Electron app simultaneously)*

3. **Configure AI:**
   - Click the gear icon (Settings) in the top right.
   - Enter your API Key, Base URL (e.g., \`https://api.openai.com/v1\`), and Model name.

## Notes
- To use the AI capabilities, open a folder first. The AI is instructed to create files directly in the opened directory using special XML tags, and the IDE parses these to automatically create or update files on disk.
