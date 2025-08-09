import React from "react";
import { logout } from "../lib/auth";

export default function Topbar({ email }: { email: string }) {
  return (
    <div className="topbar">
      <div className="brand">Veloxa</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="user-pill">{email}</div>
        <button className="out-btn" onClick={() => logout()}>Log out</button>
      </div>
    </div>
  );
}
