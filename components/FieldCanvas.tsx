"use client";

import { useEffect, useRef } from "react";

/**
 * The live field behind the page: a grid of points that leans away from the
 * pointer and lights up near it, with a signal travelling along the lattice.
 * Canvas rather than DOM — thousands of points at 60fps, and it costs the
 * layout nothing. Draws one still frame and stops under reduced motion.
 */
export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 34;
    const REACH = 190;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points: { x: number; y: number }[] = [];

    const pointer = { x: -9999, y: -9999, active: false };
    let t = 0;
    let frame = 0;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = [];
      for (let y = GAP / 2; y < height + GAP; y += GAP) {
        for (let x = GAP / 2; x < width + GAP; x += GAP) {
          points.push({ x, y });
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // a slow band of light sweeping down the lattice
      const band = ((t * 0.35) % (height + 500)) - 250;

      for (const p of points) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);

        let ox = 0;
        let oy = 0;
        let lift = 0;

        if (pointer.active && dist < REACH) {
          const force = (1 - dist / REACH) ** 2;
          ox = (dx / (dist || 1)) * force * 16;
          oy = (dy / (dist || 1)) * force * 16;
          lift = force;
        }

        const wave = Math.max(0, 1 - Math.abs(p.y - band) / 210);
        const drift = Math.sin(t * 0.0016 + p.x * 0.012 + p.y * 0.008) * 1.4;

        const glow = Math.min(1, lift * 1.15 + wave * 0.55);
        const r = 1 + glow * 2.1;

        ctx!.beginPath();
        ctx!.arc(p.x + ox + drift, p.y + oy, r, 0, Math.PI * 2);
        ctx!.fillStyle =
          glow > 0.02
            ? `rgba(${Math.round(120 + glow * 40)}, ${Math.round(
                130 + glow * 35,
              )}, 255, ${0.1 + glow * 0.72})`
            : "rgba(255,255,255,0.055)";
        ctx!.fill();
      }

      // short connectors near the pointer, so the field feels like a mesh
      if (pointer.active) {
        ctx!.lineWidth = 1;
        for (const p of points) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d > REACH * 0.62) continue;
          const a = (1 - d / (REACH * 0.62)) * 0.3;
          ctx!.strokeStyle = `rgba(120,132,255,${a})`;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(pointer.x, pointer.y);
          ctx!.stroke();
        }
      }
    }

    function loop() {
      t += 16;
      draw();
      frame = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onResize = () => {
      build();
      if (reduce) draw();
    };

    build();

    if (reduce) {
      draw();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      frame = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas id="field" ref={ref} aria-hidden="true" />;
}
