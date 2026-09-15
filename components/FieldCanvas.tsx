"use client";

import { useEffect, useRef } from "react";

/**
 * The live field behind the page: a grid of points that leans away from the
 * pointer and lights up near it, with a signal travelling along the lattice.
 *
 * The trick that keeps it at 60fps is batching. A thousand points drawn one
 * at a time means a thousand fillStyle changes; instead every point is sorted
 * into one of eight brightness buckets and each bucket is filled in a single
 * path, so the whole field costs eight draw calls a frame.
 */
export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const GAP = 36;
    const REACH = 190;
    const REACH2 = REACH * REACH;
    const LINK = REACH * 0.62;
    const LINK2 = LINK * LINK;

    // eight brightness steps crossed with four vignette steps: every point
    // lands in one of thirty-two buckets, each of which is a single fill
    const LEVELS = 8;
    const FADES = 4;
    const FADE_AT = [1, 0.72, 0.42, 0.16];
    const LAYER = 0.85; // was the layer's opacity, folded into the colours
    const fills: string[] = [];
    const radii: number[] = [];
    for (let i = 0; i < LEVELS; i++) {
      const g = i / (LEVELS - 1);
      radii.push(1 + g * 2.1);
      for (let f = 0; f < FADES; f++) {
        const a = (i === 0 ? 0.055 : 0.1 + g * 0.72) * FADE_AT[f] * LAYER;
        fills.push(
          i === 0
            ? `rgba(255,255,255,${a.toFixed(4)})`
            : `rgba(${Math.round(120 + g * 40)}, ${Math.round(130 + g * 35)}, 255, ${a.toFixed(4)})`,
        );
      }
    }
    const BUCKETS = LEVELS * FADES;
    const bucketX: number[][] = Array.from({ length: BUCKETS }, () => []);
    const bucketY: number[][] = Array.from({ length: BUCKETS }, () => []);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let px: Float32Array = new Float32Array(0);
    let py: Float32Array = new Float32Array(0);
    // vignette step per point, precomputed on build: -1 means never drawn
    let fade: Int8Array = new Int8Array(0);

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

      const cols = Math.ceil((width + GAP) / GAP);
      const rows = Math.ceil((height + GAP) / GAP);
      px = new Float32Array(cols * rows);
      py = new Float32Array(cols * rows);
      fade = new Int8Array(cols * rows);
      let n = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = GAP / 2 + c * GAP;
          const y = GAP / 2 + r * GAP;
          px[n] = x;
          py[n] = y;
          fade[n] = fadeStep(x, y);
          n++;
        }
      }
    }

    /**
     * The vignette the design calls for: an ellipse centred above the middle,
     * solid to 45% of its radius and gone by 92%. Quantised to four steps so
     * points can be batched, and to -1 where nothing would be visible.
     */
    function fadeStep(x: number, y: number) {
      const nx = (x - width * 0.5) / (width * 1.2);
      const ny = (y - height * 0.3) / (height * 0.9);
      const d = Math.sqrt(nx * nx + ny * ny) * 2;
      const v = d <= 0.45 ? 1 : d >= 0.92 ? 0 : 1 - (d - 0.45) / 0.47;
      if (v < 0.08) return -1;
      if (v > 0.86) return 0;
      if (v > 0.57) return 1;
      if (v > 0.29) return 2;
      return 3;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // a slow band of light sweeping down the lattice
      const band = ((t * 0.35) % (height + 500)) - 250;
      const active = pointer.active;
      const pxr = pointer.x;
      const pyr = pointer.y;

      for (let i = 0; i < BUCKETS; i++) {
        bucketX[i].length = 0;
        bucketY[i].length = 0;
      }

      for (let i = 0; i < px.length; i++) {
        const f = fade[i];
        if (f < 0) continue;
        const x = px[i];
        const y = py[i];

        let ox = 0;
        let oy = 0;
        let lift = 0;

        if (active) {
          const dx = x - pxr;
          const dy = y - pyr;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH2) {
            const dist = Math.sqrt(d2) || 1;
            const force = (1 - dist / REACH) ** 2;
            ox = (dx / dist) * force * 16;
            oy = (dy / dist) * force * 16;
            lift = force;
          }
        }

        const wave = Math.max(0, 1 - Math.abs(y - band) / 210);
        const drift = Math.sin(t * 0.0016 + x * 0.012 + y * 0.008) * 1.4;
        const glow = Math.min(1, lift * 1.15 + wave * 0.55);

        const level = glow < 0.02 ? 0 : Math.min(LEVELS - 1, 1 + ((glow * (LEVELS - 1)) | 0));
        const k = level * FADES + f;
        bucketX[k].push(x + ox + drift);
        bucketY[k].push(y + oy);
      }

      // level 0 is the resting lattice — square dots read the same as circles
      // at one pixel and cost a fraction of an arc
      for (let f = 0; f < FADES; f++) {
        const bx = bucketX[f];
        if (!bx.length) continue;
        const by = bucketY[f];
        ctx!.fillStyle = fills[f];
        ctx!.beginPath();
        for (let i = 0; i < bx.length; i++) {
          ctx!.rect(bx[i] - 1, by[i] - 1, 2, 2);
        }
        ctx!.fill();
      }

      for (let k = FADES; k < BUCKETS; k++) {
        const bx = bucketX[k];
        if (!bx.length) continue;
        const by = bucketY[k];
        const r = radii[(k / FADES) | 0];
        ctx!.fillStyle = fills[k];
        ctx!.beginPath();
        for (let i = 0; i < bx.length; i++) {
          ctx!.moveTo(bx[i] + r, by[i]);
          ctx!.arc(bx[i], by[i], r, 0, Math.PI * 2);
        }
        ctx!.fill();
      }

      // short connectors near the pointer, so the field feels like a mesh:
      // three alpha steps, one stroke each
      if (active) {
        ctx!.lineWidth = 1;
        for (let step = 0; step < 3; step++) {
          ctx!.strokeStyle = `rgba(120,132,255,${(0.3 * (1 - step / 3)).toFixed(3)})`;
          ctx!.beginPath();
          let any = false;
          for (let i = 0; i < px.length; i++) {
            if (fade[i] < 0) continue;
            const dx = px[i] - pxr;
            const dy = py[i] - pyr;
            const d2 = dx * dx + dy * dy;
            if (d2 > LINK2) continue;
            const s = ((Math.sqrt(d2) / LINK) * 3) | 0;
            if (s !== step) continue;
            ctx!.moveTo(px[i], py[i]);
            ctx!.lineTo(pxr, pyr);
            any = true;
          }
          if (any) ctx!.stroke();
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
    const onResize = () => build();

    build();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas id="field" ref={ref} aria-hidden="true" />;
}
