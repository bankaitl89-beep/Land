"use client";

import { useEffect, useRef } from "react";

/**
 * The opening dive — through a neural network, not past a cloud of dots.
 *
 * A sphere of points is particles: it reads as stars and says nothing about
 * what this course is for. What reads as a neural network is the thing every
 * diagram of one shows: layers of neurons, edges from every neuron to the
 * next layer, and signals running along those edges and lighting the neurons
 * they arrive at. So that is what this is. Eight layers stacked into the
 * screen, the camera flying through them as the page scrolls.
 *
 * It is computed rather than filmed — the reference effect scrubs three
 * hundred pre-rendered frames and twelve megabytes for a car, which arithmetic
 * does not need. Nothing downloads and it is sharp at any pixel density.
 *
 * The cost is held down by projecting each neuron once per frame into flat
 * arrays, then letting the eight hundred edges and the signals on them read
 * those arrays instead of doing their own maths, and by drawing everything in
 * a handful of batched paths rather than one path per element.
 */
export default function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const LAYERS = 8;
    const PER_LAYER = 40;
    const COUNT = LAYERS * PER_LAYER;
    const FAN = 3; // edges forward from each neuron
    const RADIUS = 0.95;
    const Z_NEAR = 1.2; // the layer closest to the reader
    const Z_GAP = 0.6;

    // the camera starts outside the whole stack and ends among the first
    // layers, with the rest of the network still ahead of it
    const Z_START = 3.7;
    const Z_END = 0.45;
    const DIVE_SCREENS = 2.4;

    // ---- neurons ------------------------------------------------------
    const nx = new Float32Array(COUNT);
    const ny = new Float32Array(COUNT);
    const nz = new Float32Array(COUNT);
    const act = new Float32Array(COUNT); // how recently a signal arrived
    {
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let l = 0; l < LAYERS; l++) {
        const z = Z_NEAR - l * Z_GAP;
        for (let i = 0; i < PER_LAYER; i++) {
          const k = l * PER_LAYER + i;
          // a golden-angle spiral fills a disc evenly; a ring or a grid would
          // read as a pattern rather than as a layer of cells
          const r = Math.sqrt((i + 0.5) / PER_LAYER) * RADIUS;
          const th = i * golden + l * 0.7;
          nx[k] = Math.cos(th) * r;
          ny[k] = Math.sin(th) * r;
          nz[k] = z;
        }
      }
    }

    // ---- edges: every neuron reaches into the next layer ---------------
    const E = (LAYERS - 1) * PER_LAYER * FAN;
    const eFrom = new Int32Array(E);
    const eTo = new Int32Array(E);
    // where each neuron's own outgoing edges start, so a signal that arrives
    // can pick one to continue along without searching
    const outStart = new Int32Array(COUNT + 1);
    {
      let e = 0;
      for (let l = 0; l < LAYERS - 1; l++) {
        for (let i = 0; i < PER_LAYER; i++) {
          const from = l * PER_LAYER + i;
          outStart[from] = e;
          // the FAN nearest neurons in the next layer, by distance across
          // the layer — near connections read as structure, random ones as
          // noise
          const base = (l + 1) * PER_LAYER;
          const best = [-1, -1, -1];
          const bestD = [Infinity, Infinity, Infinity];
          for (let j = 0; j < PER_LAYER; j++) {
            const t = base + j;
            const dx = nx[t] - nx[from];
            const dy = ny[t] - ny[from];
            const d = dx * dx + dy * dy;
            if (d < bestD[0]) {
              bestD[2] = bestD[1]; best[2] = best[1];
              bestD[1] = bestD[0]; best[1] = best[0];
              bestD[0] = d; best[0] = t;
            } else if (d < bestD[1]) {
              bestD[2] = bestD[1]; best[2] = best[1];
              bestD[1] = d; best[1] = t;
            } else if (d < bestD[2]) {
              bestD[2] = d; best[2] = t;
            }
          }
          for (let f = 0; f < FAN; f++) {
            eFrom[e] = from;
            eTo[e] = best[f] >= 0 ? best[f] : base;
            e++;
          }
        }
      }
      // the last layer has no outgoing edges
      for (let i = (LAYERS - 1) * PER_LAYER; i <= COUNT; i++) outStart[i] = e;
    }

    // ---- signals travelling the edges ----------------------------------
    const PULSES = 110;
    const pEdge = new Int32Array(PULSES);
    const pT = new Float32Array(PULSES);
    const pV = new Float32Array(PULSES);
    const deepestFirstEdge = (LAYERS - 2) * PER_LAYER * FAN;

    function seed(i: number) {
      // signals start at the far side and run toward the reader, so the
      // network reads as computing its way out to them
      pEdge[i] = deepestFirstEdge + ((Math.random() * PER_LAYER * FAN) | 0);
      pT[i] = Math.random();
      pV[i] = 0.006 + Math.random() * 0.010;
    }
    for (let i = 0; i < PULSES; i++) seed(i);

    function step() {
      for (let i = 0; i < PULSES; i++) {
        pT[i] += pV[i];
        if (pT[i] < 1) continue;
        const to = eTo[pEdge[i]];
        act[to] = 1; // the neuron fires
        const s = outStart[to];
        const n = outStart[to + 1] - s;
        if (n > 0) {
          pEdge[i] = s + ((Math.random() * n) | 0);
          pT[i] = 0;
          pV[i] = 0.006 + Math.random() * 0.010;
        } else {
          seed(i); // reached the output layer, start again at the far side
        }
      }
      for (let i = 0; i < COUNT; i++) act[i] *= 0.93;
    }

    // ---- projection scratch --------------------------------------------
    const sx = new Float32Array(COUNT);
    const sy = new Float32Array(COUNT);
    const sNear = new Float32Array(COUNT);
    const sOk = new Uint8Array(COUNT);

    const LEVELS = 7;
    const nodeFill: string[] = [];
    const nodeR: number[] = [];
    for (let i = 0; i < LEVELS; i++) {
      const g = i / (LEVELS - 1);
      nodeR.push(0.9 + g * 2.6);
      nodeFill.push(
        `rgba(${Math.round(120 + g * 46)}, ${Math.round(130 + g * 40)}, 255, ${(
          0.16 + g * 0.6
        ).toFixed(3)})`,
      );
    }
    const bx: number[][] = Array.from({ length: LEVELS }, () => []);
    const by: number[][] = Array.from({ length: LEVELS }, () => []);

    const EDGE_STEPS = 3;
    const edgeStroke = [
      "rgba(118,130,245,0.34)",
      "rgba(110,122,236,0.19)",
      "rgba(104,116,226,0.09)",
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let focal = 700;
    let frame = 0;
    let t = 0;
    let camZ = Z_START;
    let tiltX = 0;
    let tiltY = 0;
    let wantTiltX = 0;
    let wantTiltY = 0;
    let presence = 1;
    let narrow = false;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = width < 760;
      focal = Math.min(width, height) * (narrow ? 0.8 : 1.0);
    }

    function readScroll() {
      const runway = window.innerHeight * DIVE_SCREENS;
      const raw = Math.max(0, window.scrollY / runway);
      const p = Math.min(1, raw);
      const eased = p * p * (3 - 2 * p);
      camZ = Z_START + (Z_END - Z_START) * eased;
      // once the reader is inside, the network has to get out from under the
      // words, so it recedes over the screen that follows and stays there
      presence = raw <= 1 ? 1 : Math.max(0.26, 1 - (raw - 1) * 1.15);
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalAlpha = narrow ? presence * 0.55 : presence;

      // On a wide screen the left half of the hero is the headline and the
      // price; the network sits in the right half, where the page has no
      // words, until the dive pulls it over everything.
      const drift = Math.min(1, Math.max(0, (camZ - Z_END) / (Z_START - Z_END)));
      const cx = width * (narrow ? 0.5 : 0.5 + 0.18 * drift);
      const cy = height * (narrow ? 0.66 : 0.47);

      tiltX += (wantTiltX - tiltX) * 0.06;
      tiltY += (wantTiltY - tiltY) * 0.06;
      // Held at an angle on purpose. Looked at straight down the axis of the
      // stack the layers superimpose and the whole thing reads as a random
      // web; turned thirty degrees they separate and you can see that it is
      // built of layers. The slow drift on top keeps it from looking like a
      // still diagram.
      const ay = 0.55 + Math.sin(t * 0.00011) * 0.16 + tiltY;
      const ax = -0.2 + Math.sin(t * 0.00008 + 1.1) * 0.1 + tiltX;
      const sinY = Math.sin(ay);
      const cosY = Math.cos(ay);
      const sinX = Math.sin(ax);
      const cosX = Math.cos(ax);

      // --- project every neuron once ---
      for (let i = 0; i < COUNT; i++) {
        const x0 = nx[i];
        const y0 = ny[i];
        const z0 = nz[i];
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = z0 * cosY - x0 * sinY;
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = z1 * cosX + y0 * sinX;

        const depth = camZ - z2;
        if (depth < 0.12) {
          sOk[i] = 0;
          continue;
        }
        const k = focal / depth;
        const px = cx + x1 * k;
        const py = cy + y2 * k;
        if (px < -400 || px > width + 400 || py < -400 || py > height + 400) {
          sOk[i] = 0;
          continue;
        }
        sOk[i] = 1;
        sx[i] = px;
        sy[i] = py;
        // the far layers have to stay faintly visible, or the network looks
        // like two layers rather than eight
        sNear[i] = Math.min(1, Math.max(0, 1 - (depth - 0.2) / 7.2));
      }

      // --- edges, in three brightness bands ---
      ctx!.lineWidth = 1;
      for (let band = 0; band < EDGE_STEPS; band++) {
        ctx!.strokeStyle = edgeStroke[band];
        ctx!.beginPath();
        let any = false;
        for (let e = 0; e < E; e++) {
          const a = eFrom[e];
          const b = eTo[e];
          if (!sOk[a] || !sOk[b]) continue;
          const near = (sNear[a] + sNear[b]) * 0.5;
          const s = Math.min(EDGE_STEPS - 1, ((1 - near) * EDGE_STEPS) | 0);
          if (s !== band) continue;
          ctx!.moveTo(sx[a], sy[a]);
          ctx!.lineTo(sx[b], sy[b]);
          any = true;
        }
        if (any) ctx!.stroke();
      }

      // --- neurons, bucketed by distance and by whether they just fired ---
      for (let i = 0; i < LEVELS; i++) {
        bx[i].length = 0;
        by[i].length = 0;
      }
      for (let i = 0; i < COUNT; i++) {
        if (!sOk[i]) continue;
        const lit = Math.min(1, sNear[i] + act[i] * 0.75);
        const lvl = Math.min(LEVELS - 1, (lit * (LEVELS - 1) + 0.5) | 0);
        bx[lvl].push(sx[i]);
        by[lvl].push(sy[i]);
      }
      for (let l = 0; l < LEVELS; l++) {
        const xs = bx[l];
        if (!xs.length) continue;
        const ys = by[l];
        const r = nodeR[l];
        ctx!.fillStyle = nodeFill[l];
        ctx!.beginPath();
        for (let i = 0; i < xs.length; i++) {
          ctx!.moveTo(xs[i] + r, ys[i]);
          ctx!.arc(xs[i], ys[i], r, 0, Math.PI * 2);
        }
        ctx!.fill();
      }

      // --- the signals themselves, the brightest thing on screen ---
      ctx!.fillStyle = "rgba(196,204,255,0.92)";
      ctx!.beginPath();
      for (let i = 0; i < PULSES; i++) {
        const e = pEdge[i];
        const a = eFrom[e];
        const b = eTo[e];
        if (!sOk[a] || !sOk[b]) continue;
        const f = pT[i];
        const x = sx[a] + (sx[b] - sx[a]) * f;
        const y = sy[a] + (sy[b] - sy[a]) * f;
        const r = 1 + (sNear[a] + sNear[b]) * 0.9;
        ctx!.moveTo(x + r, y);
        ctx!.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx!.fill();
    }

    function loop() {
      t += 16;
      step();
      draw();
      frame = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      wantTiltY = (e.clientX / window.innerWidth - 0.5) * 0.45;
      wantTiltX = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    const onScroll = () => readScroll();
    const onResize = () => {
      build();
      readScroll();
    };

    build();
    readScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas id="field" ref={ref} aria-hidden="true" />;
}
