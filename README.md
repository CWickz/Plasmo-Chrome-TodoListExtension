Task Flow
A modern, glassmorphic Chrome extension designed for effortless task management and quick clipboard snippet storage. Built with Plasmo, React, and TypeScript.

Features
Glassmorphic UI & Smooth Animation: Modern frosted-glass aesthetic with fluid micro-interactions and smooth elastic scrolling.

Task & Checklist Management: Organize tasks into expandable categories with progress percentage badges.

Inline Editing: Double-click or tap the edit icon to rename categories and subtasks inline.

Clipboard Manager: Capture, store, and pin text snippets with a one-click system clipboard grabber and fast copy-to-clipboard actions.

Snippet-to-Task Conversion: Convert any saved clipboard snippet directly into a new task with a single tap.

Acoustic Audio Engine: Procedural Web Audio API sound effects for clicks, adds, completions, and deletions without external audio assets.

Dark & Light Mode: Persistent theme switcher with custom-tailored palettes and glowing atmospheric backdrops.

Local Storage Persistence: Uses @plasmohq/storage backed by chrome.storage.local to support large code snippets and text blocks.

Tech Stack
Framework: Plasmo Framework

UI Library: React 18

Language: TypeScript

State & Storage: @plasmohq/storage

Audio: Web Audio API (Synthesized in-browser)

Project Structure
Plaintext
todo-extension/
├── assets/
│   └── icon.png          # Extension icon (512x512 PNG)
├── src/
│   └── popup.tsx         # Main popup interface & state logic
├── package.json          # Manifest permissions & dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md
Getting Started
Prerequisites
Node.js (version 18+ recommended)

npm or pnpm

Installation
Clone the repository:

Bash
git clone https://github.com/your-username/task-flow.git
cd task-flow
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Load the extension in Chrome:

Open Chrome and navigate to chrome://extensions.

Enable Developer mode in the top right corner.

Click Load unpacked.

Select the build/chrome-mv3-dev folder generated in your project directory.

Production Build
To package the extension for production or deployment to the Chrome Web Store:

Bash
npm run build
The production-ready bundle will be output to the build/chrome-mv3-prod directory.

To create a zipped package ready for store submission:

Bash
npm run package
Permissions
Configured in package.json under the "manifest" field:

storage: Persists categories, subtasks, clipboard snippets, and theme preferences.

clipboardRead: Allows reading the system clipboard for the quick-grab feature.

clipboardWrite: Allows copying snippets directly back to your clipboard.
