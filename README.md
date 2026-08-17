Task Flow v1.0 ⚡
A high-performance, glassmorphic task manager and clipboard suite built for Chrome using Plasmo, React, and TypeScript.

🛠️ Tech Stack
Framework: Plasmo Framework (Manifest V3)

UI: React 18 + TypeScript

State & Storage: @plasmohq/storage (Local Storage Engine)

Audio Engine: Web Audio API (Synthesized Micro-Acoustics)

Styling: Glassmorphism CSS + Fluid Transitions

⚡ Key Features
Adaptive Glassmorphism: Translucent frosted-glass interface with synchronized Dark and Light modes.

Micro-Acoustic Feedback: Synthesized audio chimes for task completions, pops, and deletions with zero external audio assets.

Inline Task Editing: Double-click or trigger inline editing for task lists and subtasks on the fly.

Instant Clipboard Suite: One-click system clipboard grabber, snippet pinboard, and direct snippet-to-task conversion.

Infinite Local Storage: Backed by chrome.storage.local to handle large code blocks, logs, and multi-line text without quota limits.

📥 Download & Installation
To install the pre-built unpacked extension directly in Chrome:

Download the latest release build (task-flow-v1.0.0.zip).

Extract the .zip archive on your machine.

Open Chrome and navigate to chrome://extensions.

Enable Developer mode in the top-right corner.

Click Load unpacked and select the extracted folder.

🚀 How to Run (Development)
To modify or run the extension from source:

Clone and install dependencies:

Bash
npm install
Start the hot-reloading development server:

Bash
npm run dev
Build for production:

Bash
npm run build
Package for Chrome Web Store:

Bash
npm run package
