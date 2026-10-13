<div align="center">

# 🤖 AI IDE: The Intelligent Development Environment

![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A powerful, next-generation Desktop IDE that seamlessly integrates artificial intelligence directly into your workflow. Say goodbye to copying and pasting from browser tabs – this AI writes the code directly to your disk!

</div>

---

## ✨ Features

- 🎨 **Dark Neon Blue Theme**: A sleek, cyber-inspired user interface designed to reduce eye strain and look cool.
- 📁 **Native File Explorer**: Full access to your local file system. Open any folder and manage your workspace easily.
- 📝 **Monaco Editor**: The same robust editing engine that powers VS Code. Enjoy best-in-class syntax highlighting (perfect for Python, JS, TS, etc.), auto-completion, and code navigation.
- 🖥️ **Integrated Terminal**: A fully functional, embedded terminal (`xterm.js` + `node-pty`) connected directly to your local shell. Run scripts, see errors, and manage dependencies without leaving the app.
- 🧠 **Autonomous AI Agent**: The core of the IDE. A built-in chat interface connects to your preferred AI model (OpenAI, local models via LM Studio, OpenRouter, etc.).
  - *Magic capability*: The AI doesn't just give you code; it formats responses using special tags that the IDE intercepts to **automatically create and update files on your disk**. It writes the project for you!

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Python (if you plan to write and run Python scripts)

### Installation

1. **Clone the repository** (or download the source code):
   ```bash
   git clone <your-repo-url>
   cd ai-ide
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the IDE in development mode**:
   ```bash
   npm run dev:full
   ```
   *This command spins up the Vite frontend and the Electron backend simultaneously.*

---

## ⚙️ Configuring the AI

To unlock the magic, you need to connect an AI model:

1. Click the **⚙️ Settings** icon in the top right corner of the IDE.
2. Enter your **API Key**.
3. (Optional) Change the **Base URL**. If you are using standard ChatGPT, leave it as `https://api.openai.com/v1`. If you are using local models (like LM Studio or Ollama), point it to your local server (e.g., `http://localhost:1234/v1`).
4. Set the **Model Name** (e.g., `gpt-4o`, `gpt-3.5-turbo`, or the name of your local model).

---

## 🛠️ How to use the "Auto-Coding" feature

1. **Open a folder**: Click the "Open Folder" button in the top left and select a workspace on your PC.
2. **Talk to the AI**: In the right-hand Chat Panel, ask the AI to build something.
   - *Example prompt: "Create a Python script named `scraper.py` that fetches the title of a webpage."*
3. **Watch it work**: The AI will respond and format the code. The IDE will automatically detect this, create the file `scraper.py` in your folder, and save the code inside it!

---

<div align="center">
  <i>Built with ❤️ for developers who want to code faster.</i>
</div>
