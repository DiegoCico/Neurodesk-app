import React, { useState } from 'react';
import CommandOverlay from './CommandOverlay';

export default function MainDesktop() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '10px 16px',
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #333',
          background: '#111',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        New Command
      </button>

      <CommandOverlay
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(text) => {
          // Wire this to your IPC / backend
          (window as any).veloxa?.runCommand?.(text);
          // or:
          // (window as any).ipcRenderer?.invoke?.('commands.run', text)
          console.log('run command:', text);
        }}
      />
    </div>
  );
}
