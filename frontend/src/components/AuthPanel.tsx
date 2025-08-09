import React, { useEffect, useState } from "react";
import { login, signup, logout, watchAuth } from "../lib/auth";

export default function AuthPanel() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return watchAuth(setCurrentUser);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(userEmail, password);
      } else {
        await signup(userEmail, password);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Auth error");
    } finally {
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div style={panel}>
        <div style={title}>Signed in</div>
        <div style={row}><b>Email:</b>&nbsp;{currentUser.email}</div>
        <button style={button} onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return (
    <form style={panel} onSubmit={handleSubmit}>
      <div style={tabs}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{ ...tab, ...(mode === "login" ? activeTab : {}) }}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={{ ...tab, ...(mode === "signup" ? activeTab : {}) }}
        >
          Sign up
        </button>
      </div>

      <label style={label}>Email</label>
      <input
        style={input}
        type="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <label style={label}>Password</label>
      <input
        style={input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {err && <div style={error}>{err}</div>}

      <button style={button} disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}

const panel: React.CSSProperties = {
  width: 360,
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  display: "grid",
  gap: 10,
};

const title: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 8 };
const label: React.CSSProperties = { fontSize: 12, opacity: 0.8 };
const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.1)",
  outline: "none",
};
const error: React.CSSProperties = {
  color: "#b00020",
  background: "rgba(176,0,32,0.08)",
  padding: "8px 10px",
  borderRadius: 10,
  fontSize: 12,
};
const button: React.CSSProperties = {
  marginTop: 8,
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};
const tabs: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8 };
const tab: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.1)",
  background: "white",
  cursor: "pointer",
};
const activeTab: React.CSSProperties = { background: "#f2f4ff", borderColor: "#c7d2fe" };
const row: React.CSSProperties = { margin: "8px 0" };
