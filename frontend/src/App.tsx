import React, { useEffect, useState } from "react";
import "./theme.css";
import Starfield from "./components/Starfield";
import AuthCard from "./components/AuthCard";
import { watchAuth, logout } from "./lib/auth";

/** Placeholder for your main desktop UI after auth */
function DesktopShell() {
  return (
    <div style={{ position: "fixed", inset: 0, padding: 16 }}>
      <div className="glass" style={{
        height: 48, display: "flex", alignItems: "center", padding: "0 12px",
        borderRadius: 14, gap: 12
      }}>
        <div style={{ fontWeight: 700 }}>Neurodek</div>
        <div style={{ opacity: 0.7 }}>•</div>
        <div style={{ opacity: 0.7 }}>Ready</div>
        <div style={{ marginLeft: "auto" }}>
          <button className="button" onClick={() => logout()}>Log out</button>
        </div>
      </div>
      {/* Your app content goes here */}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => watchAuth(u => setAuthed(!!u)), []);

  return (
    <>
      <Starfield />
      <div className="vignette" />

      {/* Brand (top-left) */}
      <div className="brand">
        <div className="brand-badge" />
        <div>Neurodek</div>
      </div>

      {/* Centered container */}
      <div style={{
        position: "fixed", inset: 0, display: "grid",
        placeItems: "center", padding: 24
      }}>
        {authed ? <DesktopShell /> : <AuthCard />}
      </div>
    </>
  );
}
