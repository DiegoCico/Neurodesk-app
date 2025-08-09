import React, { useEffect, useRef, useState } from "react";

export type CommandOverlayProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (text: string) => void;
};

const CommandOverlay: React.FC<CommandOverlayProps> = ({ open, onClose, onSubmit }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit?.(text);
    setValue("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, cursor: "default" }}
    >
      {/* subtle moving stars */}
      <OverlayStars />

      {/* center blur (screen-share vibe) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0) 58%)",
          maskImage:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0) 58%)",
        } as React.CSSProperties}
      />

      {/* dark edges → transparent center */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.7) 85%)",
        }}
      />

      {/* black outline around whole screen */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          boxSizing: "border-box",
          border: "3px solid #000",
          borderRadius: 8,
          pointerEvents: "none",
        }}
      />

      {/* top-center command box */}
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 32,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(840px, 88vw)",
          display: "flex",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <input
          ref={inputRef}
          placeholder="Type a command…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          aria-label="Command input"
          style={{
            width: "100%",
            fontSize: 18,
            lineHeight: "48px",
            height: 48,
            padding: "0 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(20,20,20,0.72)",
            color: "#fff",
            outline: "none",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />
      </form>
    </div>
  );
};

export default CommandOverlay;

/** tiny animated starfield */
function OverlayStars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;
    let destroyed = false;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const n = Math.min(
      400,
      Math.round((window.innerWidth * window.innerHeight) / 4500)
    );
    const stars = Array.from({ length: n }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.6 + Math.random() * 1.6,
      vy: 0.06 + Math.random() * 0.22,
      tw: 0.5 + Math.random() * 0.9,
    }));

    const loop = (t: number) => {
      if (destroyed) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "#fff";
      for (const s of stars) {
        s.y += s.vy;
        if (s.y - s.r > window.innerHeight) {
          s.y = -s.r;
          s.x = Math.random() * window.innerWidth;
        }
        const twinkle =
          0.55 + 0.45 * Math.sin((t / 1000 + s.x * 0.01 + s.y * 0.01) * s.tw);
        ctx.globalAlpha = 0.35 * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9998,
      }}
    />
  );
}
