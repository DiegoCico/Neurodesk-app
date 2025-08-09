import React, { useEffect, useRef } from "react";

/** lightweight moving starfield using canvas */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const anim = useRef<number | null>(null);
  const stars = useRef<{x:number;y:number;z:number;vz:number}[]>([]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const initStars = (count = Math.floor((w*h) / 14000)) => {
      stars.current = Array.from({ length: count }).map(() => ({
        x: (Math.random() - 0.5) * w,
        y: (Math.random() - 0.5) * h,
        z: Math.random() * 1 + 0.2,
        vz: Math.random() * 0.04 + 0.02,
      }));
    };
    initStars();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      for (const s of stars.current) {
        s.z += s.vz;           // drift
        if (s.z > 2.2) s.z = 0.2;
        const sx = (s.x / s.z) + w/2;
        const sy = (s.y / s.z) + h/2;
        const r = Math.max(0.4, 1.8 - s.z); // small twinkle via z
        const alpha = Math.max(0.15, 0.9 - s.z/2);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      anim.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (anim.current) cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", display: "block", background: "#000" }}
    />
  );
}
