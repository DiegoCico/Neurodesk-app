import React, { useEffect, useState } from "react";
import "./theme.css";
import Starfield from "./components/Starfield";
import AuthCard from "./components/AuthCard";
import MainDesktop from "./components/MainDesktop";
import { watchAuth } from "./lib/auth";
import { initPersistence } from "./lib/firebase";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase persistence, then subscribe to auth changes
    let unsub = () => {};
    initPersistence()
      .catch(() => {}) // ignore if already initialized
      .finally(() => {
        unsub = watchAuth((user) => {
          setAuthed(!!user);
          setReady(true);
        });
      });
    return () => unsub();
  }, []);

  return (
    <>
      {/* global bg */}
      <Starfield />
      <div className="vignette" />

      {/* brand (top-left) */}
      <div className="brand">
        <div className="brand-badge" />
        <div>Neurodek</div>
      </div>

      {/* centered content */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        {!ready ? (
          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            Loading…
          </div>
        ) : authed ? (
          <MainDesktop />
        ) : (
          <AuthCard />
        )}
      </div>
    </>
  );
}
