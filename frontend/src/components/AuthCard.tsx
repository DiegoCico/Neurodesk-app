import React, { useEffect, useState } from "react";
import { login, signup, logout, watchAuth } from "../lib/auth";
import { applyPersistence } from "../lib/firebase";

type Mode = "login" | "signup";

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // seed checkbox from stored preference
    const stored = localStorage.getItem("rememberMe");
    setRemember(stored === null ? true : stored === "1");
    return watchAuth(setUser);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      // IMPORTANT: set persistence BEFORE the auth call
      await applyPersistence(remember);
      if (mode === "login") await login(email, pw);
      else await signup(email, pw);
    } catch (e: any) {
      setErr(e?.message ?? "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="glass" style={card}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Welcome back</div>
        <div style={{ opacity: 0.85, marginBottom: 16 }}>{user.email}</div>
        <button className="button" onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return (
    <form className="glass" style={card} onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign in</button>
        <button type="button" className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Create account</button>
      </div>

      <label style={label}>Email</label>
      <input className="input" type="email" placeholder="you@cosmos.dev"
             value={email} onChange={e => setEmail(e.target.value)} required />

      <label style={label}>Password</label>
      <input className="input" type="password" placeholder="••••••••"
             value={pw} onChange={e => setPw(e.target.value)} required />

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Remember this device</span>
      </label>

      {err && <div style={error}>{err}</div>}

      <button className="button" disabled={loading} style={{ marginTop: 6 }}>
        {loading ? "Please wait…" : (mode === "login" ? "Sign in" : "Create account")}
      </button>
    </form>
  );
}

const card: React.CSSProperties = {
  width: 380,
  padding: 22,
  borderRadius: 18,
  display: "grid",
  gap: 10,
  position: "relative",
};

const label: React.CSSProperties = { fontSize: 12, color: "var(--muted)" };

const error: React.CSSProperties = {
  color: "#ffb4c6",
  background: "rgba(255, 77, 109, 0.12)",
  border: "1px solid rgba(255,77,109,0.25)",
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 12,
};
