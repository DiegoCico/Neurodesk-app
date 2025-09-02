# Neurodesk

Neurodesk is a modern desktop-like web interface built with **React**, featuring a beautiful galaxy/starfield background, authentication powered by Firebase, and a command overlay system. It provides a minimal but futuristic UI with support for login/signup, top navigation, and a customizable main desktop.

---

## ✨ Features

* **Starfield & Galaxy Backgrounds**
  Immersive animated starfield (`Starfield.tsx`) and galaxy nebula background (`GalaxyBackground.tsx`) for a futuristic look

* **Authentication System**

  * `AuthPanel.tsx` and `AuthCard.tsx` provide login/signup flows with Firebase integration.
  * Supports persistence (`remember me`) and error handling

* **Topbar Navigation**
  Displays user email and logout option (`Topbar.tsx`)

* **Main Desktop UI**

  * Buttons for **Run**, **Settings**, and **Profile**.
  * Integrates with a **Command Overlay** for running commands (`MainDesktop.tsx`, `CommandOverlay.tsx`)

* **Command Overlay**

  * Triggered from the desktop.
  * Provides input with blur/vignette background effects (`overlay.css`).
  * Communicates with Electron/IPC for running backend commands

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/neurodesk.git
cd neurodesk
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Firebase

* Update your Firebase configuration in `firebase.ts` .
* Make sure authentication methods (Email/Password) are enabled in your Firebase console.

### 4. Run the App

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Starfield.tsx          # Animated starfield background
│   │   ├── GalaxyBackground.tsx   # Nebula-style galaxy background
│   │   ├── AuthPanel.tsx          # Basic login/signup panel
│   │   ├── AuthCard.tsx           # Styled auth card with persistence
│   │   ├── Topbar.tsx             # Top navigation bar
│   │   ├── MainDesktop.tsx        # Main desktop UI with buttons
│   │   ├── CommandOverlay.tsx     # Command input overlay
│   │   └── overlay.css            # Styles for overlays
│   ├── lib/
│   │   ├── firebase.ts            # Firebase configuration
│   │   └── auth.ts                # Auth functions (login/signup/logout)
```

---

## 🔧 Tech Stack

* **Frontend Framework**: [React](https://react.dev/) with TypeScript for type safety and maintainability.
* **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) with support for email/password login, signup, and persistence.
* **State Management**: Built-in React `useState` and `useEffect` hooks keep the app lightweight without extra dependencies.
* **Styling**: Handcrafted CSS (`overlay.css`) with glassmorphism-inspired UI and modern blur/vignette effects.
* **Rendering**: HTML5 Canvas is used for rendering animated starfields and nebula backgrounds, giving a dynamic and immersive look.
* **Desktop Integration (Optional)**: Hooks into [Electron](https://www.electronjs.org/) through IPC (`ipcRenderer`) for running backend commands from the overlay.
* **Tooling**: Configured with npm/yarn for dependency management and local development.

This stack was chosen to keep the project **lightweight, responsive, and visually modern** while ensuring extensibility through Firebase and optional Electron integration.


* Inspired by futuristic UIs and space-themed backgrounds.
* Built with ❤️ using React & Firebase.
