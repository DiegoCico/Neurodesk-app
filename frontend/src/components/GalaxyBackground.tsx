import { useEffect, useRef } from "react";

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);

    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const stars = Array.from({ length: Math.min(160, Math.floor((w * h) / 18000)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * Math.PI * 2,
      v: 0.005 + Math.random() * 0.01,
    }));

    const nebula = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.max(w, h) * 0.8);
    nebula.addColorStop(0, "rgba(130,120,255,0.12)");
    nebula.addColorStop(0.35, "rgba(255,120,220,0.10)");
    nebula.addColorStop(1, "rgba(0,0,0,0)");

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = nebula; ctx.fillRect(0,0,w,h);
      for (const s of stars) {
        s.a += s.v;
        const twinkle = 0.6 + Math.sin(s.a) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${0.6 * twinkle})`;
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="galaxy-layer" />;
}