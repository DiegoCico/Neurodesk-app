import React, { useState } from 'react';
import CommandOverlay from './CommandOverlay';

function IconPlay() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8.94-3.5c0-.62-.07-1.22-.2-1.8l2.11-1.65-2-3.46-2.55 1a8.3 8.3 0 0 0-3.1-1.8l-.39-2.7h-4l-.39 2.7a8.3 8.3 0 0 0-3.1 1.8l-2.55-1-2 3.46L3.26 10.2c-.13.58-.2 1.18-.2 1.8s.07 1.22.2 1.8l-2.11 1.65 2 3.46 2.55-1a8.3 8.3 0 0 0 3.1 1.8l.39 2.7h4l.39-2.7a8.3 8.3 0 0 0 3.1-1.8l2.55 1 2-3.46-2.11-1.65c.13-.58.2-1.18.2-1.8z" fill="currentColor"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" fill="currentColor"/>
    </svg>
  );
}

const squareBtn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 100,
  height: 100,
  borderRadius: 10,
  border: '1px solid #2b2b2b',
  background: '#181818',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  gap: 8,
  transition: 'transform 120ms ease, background 120ms ease, border-color 120ms ease',
};

const btnHover: React.CSSProperties = {
  transform: 'translateY(-2px)',
  background: '#202020',
};

export default function MainDesktop() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Run Command */}
        <button
          onMouseEnter={() => setHover('run')}
          onMouseLeave={() => setHover(null)}
          onClick={() => setOpen(true)}
          style={{
            ...squareBtn,
            ...(hover === 'run' ? btnHover : {}),
            background: '#0f62fe',
            border: '1px solid #0e57e6',
          }}
        >
          <IconPlay />
          <span>Run</span>
        </button>

        {/* Settings */}
        <button
          onMouseEnter={() => setHover('settings')}
          onMouseLeave={() => setHover(null)}
          onClick={() => {
            (window as any).neurodesk?.openSettings?.();
          }}
          style={{
            ...squareBtn,
            ...(hover === 'settings' ? btnHover : {}),
          }}
        >
          <IconSettings />
          <span>Settings</span>
        </button>

        {/* Profile */}
        <button
          onMouseEnter={() => setHover('profile')}
          onMouseLeave={() => setHover(null)}
          onClick={() => {
            (window as any).neurodesk?.openProfile?.();
          }}
          style={{
            ...squareBtn,
            ...(hover === 'profile' ? btnHover : {}),
          }}
        >
          <IconUser />
          <span>Profile</span>
        </button>
      </div>

      <CommandOverlay
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(text) => {
          (window as any).neurodesk?.runCommand?.(text);
          console.log('run command:', text);
        }}
      />
    </div>
  );
}
