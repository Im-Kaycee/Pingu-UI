# Pingu 🐧

A sleek, lightweight Linux terminal assistant that lives on your desktop. Ask it anything Linux — it gives you clean, verified, step-by-step commands. You copy. You paste. Done.

![Pingu UI](./src/icon.png)

---

## What it is

Pingu is a global hotkey-triggered floating modal for Ubuntu.

- Ask "how do I install Docker?" and get verified, step-by-step commands
- Paste an error and get corrected commands
- Copy any command with one click
- No autonomous execution — you stay in control

---

## Features

- **Instant answers** — verified recipe library for common software
- **AI fallback** — Gemini AI for anything not in the recipe library
- **Error context** — paste an error, get fixed commands
- **Smart caching** — repeated queries are instant, saves API quota
- **Trust indicators** — every answer shows whether it came from an official source, cache, or AI
- **System aware** — detects your Ubuntu version, architecture, and installed tools
- **Keyboard first** — summon, query, copy, dismiss without touching the mouse

---

## Stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [React](https://react.dev/) — UI
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [TypeScript](https://www.typescriptlang.org/) — type safety

---

## Requirements

- Ubuntu 22.04 or later
- Node.js 18+
- [pingu-backend](https://github.com/Im-kaycee/pingu-backend) running locally

---

## Installation

### Option A — Install the deb package (recommended)

Download the latest `.deb` from [Releases](https://github.com/Im-kaycee/pingu-ui/releases) and install:

```bash
sudo dpkg -i pingu_1.0.0_amd64.deb
```

### Option B — Run from source

```bash
git clone https://github.com/Im-kaycee/pingu-ui.git
cd pingu-ui
npm install --legacy-peer-deps
npm start
```

---

## Setup

### 1. Start the backend

Make sure [pingu-backend](https://github.com/Im-kaycee/pingu-backend) is running before launching Pingu. See the backend README for setup instructions.

### 2. Set up your hotkey

Pingu uses a system-level hotkey via Ubuntu's custom shortcuts since Electron global shortcuts don't work reliably on Wayland.

**Settings → Keyboard → View and Customise Shortcuts → Custom Shortcuts → Add:**

- Name: `Pingu Toggle`
- Command: `curl -s -X POST http://127.0.0.1:8765/toggle`
- Shortcut: `Ctrl+Shift+Space` (or whatever you prefer)

### 3. Launch Pingu

Search for **Pingu** in your app launcher and click it. It will appear in your system tray. Use your hotkey to summon and dismiss it.

### 4. Autostart on login (optional)

```bash
cp /usr/share/applications/pingu.desktop ~/.config/autostart/
```

---

## Usage

| Action | How |
|---|---|
| Summon / dismiss | Your hotkey |
| Ask a question | Type and press Enter |
| Copy a command | Click the Copy button on any step |
| Paste an error | Click the orange error bar after a result |
| Dismiss | Click anywhere outside the window |

---

## Building from source

```bash
npm run make
```

Output: `out/make/deb/x64/pingu_1.0.0_amd64.deb`

---

## Related

- [pingu-backend](https://github.com/Im-kaycee/pingu-backend) — Python FastAPI backend

---

## License

MIT