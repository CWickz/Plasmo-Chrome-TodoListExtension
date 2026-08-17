# Task Flow v1.0 ⚡

A high-performance task manager and clipboard suite built with Plasmo, React, and TypeScript.

### 🛠️ Tech Stack

* **Framework**: Plasmo (Manifest V3)
* **UI**: React + TypeScript
* **Storage**: `@plasmohq/storage` (Local Storage Engine)
* **Audio**: Web Audio API (Synthesized Micro-Acoustics)
* **Styling**: Glassmorphism CSS + Fluid Transitions

### ⚡ Key Features

* **Adaptive Glassmorphism**: Translucent frosted-glass UI with synchronized Dark and Light modes.
* **Micro-Acoustic Feedback**: Synthesized audio chimes for task completions, pops, and deletions with zero external audio assets.
* **Inline Task Editing**: Double-click or tap the edit icon to rename categories and subtasks on the fly.
* **Instant Clipboard Suite**: One-click system clipboard grabber, snippet pinboard, and direct snippet-to-task conversion.
* **Infinite Local Storage**: Backed by `chrome.storage.local` to handle large code blocks and multi-line text without quota limits.

### 🚀 How to Run (Development)

If you want to build or modify the project from source:

1. `npm install`
2. `npm run dev`
3. Build for Chrome: `npm run build`
4. Package for Web Store: `npm run package`
