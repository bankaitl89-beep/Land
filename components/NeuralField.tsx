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
export default function NeuralField({ tasks }: { tasks: readonly string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // More layers than the opening alone needs: the camera now flies for the
    // whole page, so there has to be a whole page of network in front of it.
    const LAYERS = 16;
    const PER_LAYER = 24;
    const COUNT = LAYERS * PER_LAYER;
    const FAN = 3; // edges forward from each neuron
    const RADIUS = 0.95;
    const Z_NEAR = 1.2; // the layer closest to the reader
    const Z_GAP = 0.6;

    // the camera starts outside the whole stack and ends among the first
    // layers, with the rest of the network still ahead of it
    const Z_START = 3.7;
    // where the opening dive ends, at the foot of the hero
    const Z_DIVE = 0.45;
    // and how far the camera keeps travelling per pixel scrolled after that:
    // about two layers per screenful, which is a walk rather than a flight
    const Z_PER_PX = 0.00133;
    // Past the dive the camera loops. Every fourth layer is a repeat of the
    // one four before it — see the spiral below — so sliding the camera back
    // by four layers' worth lands it on a configuration identical to the one
    // it just left, and the layers keep coming forever without a seam and
    // without a second stack of geometry to carry.
    const LOOP_SPAN = 4 * Z_GAP;
    const LOOP_TOP = 1.4;
    // How strongly the network is painted is measured against the hero alone.
    // Over the hero it is at full strength; by the foot of the hero it has
    // come down to REST and it stays there for the rest of the page. REST is
    // not a guess: at 0.13 the brightest thing the network can put behind a
    // word — a signal head at rgba(206,226,255,.94) — lifts the ground to
    // rgb(30,34,41), where the page's faintest grey still measures 4.9:1.
    let heroRun = 700;
    const REST = 0.13;
    const REST_NARROW = 0.085;

    // ---- neurons ------------------------------------------------------
    const nx = new Float32Array(COUNT);
    const ny = new Float32Array(COUNT);
    const nz = new Float32Array(COUNT);
    const act = new Float32Array(COUNT); // how recently a signal arrived
    // How long ago this neuron last finished a job. Decays far slower than
    // the flash, so a label stays marked done long enough to be read.
    const done = new Float32Array(COUNT);
    // Which job each neuron carries, or -1 for the ones that stay anonymous.
    const label = new Int32Array(COUNT).fill(-1);
    {
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let l = 0; l < LAYERS; l++) {
        const z = Z_NEAR - l * Z_GAP;
        for (let i = 0; i < PER_LAYER; i++) {
          const k = l * PER_LAYER + i;
          // a golden-angle spiral fills a disc evenly; a ring or a grid would
          // read as a pattern rather than as a layer of cells
          const r = Math.sqrt((i + 0.5) / PER_LAYER) * RADIUS;
          // the turn repeats every fourth layer, which is what lets the
          // camera loop invisibly; within a period of four it is still
          // enough to stop the layers superimposing into a moiré
          const th = i * golden + (l % 4) * 0.7;
          nx[k] = Math.cos(th) * r;
          ny[k] = Math.sin(th) * r;
          nz[k] = z;
        }
      }
    }

    {
      // The two layers nearest the reader carry words. Only the ones close
      // enough to the camera are drawn, so the count on screen stays sane
      // while the dive passes far more of them than a single sparse layer
      // ever did.
      const n = tasksRef.current.length;
      if (n > 0) {
        let given = 0;
        for (let l = 0; l < 3; l++) {
          for (let i = 0; i < PER_LAYER; i += 2) {
            label[l * PER_LAYER + i] = given % n;
            given++;
          }
        }
      }
    }

    // ---- edges: every neuron reaches toward the layer in front of it ----
    //
    // They run from the far layers toward the near one, because that is the
    // direction the signal has to travel: it starts deep in the network and
    // ends at the neurons the reader can actually see, which are the ones
    // carrying the jobs. Built the other way round — and they were, at first
    // — the signals bounce between the two deepest layers and the labels are
    // never reached at all.
    const E = (LAYERS - 1) * PER_LAYER * FAN;
    const eFrom = new Int32Array(E);
    const eTo = new Int32Array(E);
    // where each neuron's own outgoing edges start, so a signal that arrives
    // can pick one to continue along without searching. Node ids have to be
    // walked in ascending order for this to stay a valid index.
    const outStart = new Int32Array(COUNT + 1);
    {
      let e = 0;
      // the nearest layer is the end of the line: nothing leaves it
      for (let i = 0; i < PER_LAYER; i++) outStart[i] = 0;
      for (let l = 1; l < LAYERS; l++) {
        for (let i = 0; i < PER_LAYER; i++) {
          const from = l * PER_LAYER + i;
          outStart[from] = e;
          // the FAN nearest neurons in the layer ahead, by distance across
          // the layer — near connections read as structure, random ones as
          // noise
          const base = (l - 1) * PER_LAYER;
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
      outStart[COUNT] = e;
    }

    // ---- signals travelling the edges ----------------------------------
    const PULSES = 110;
    const pEdge = new Int32Array(PULSES);
    const pT = new Float32Array(PULSES);
    const pV = new Float32Array(PULSES);
    const deepestFirstEdge = outStart[(LAYERS - 1) * PER_LAYER];

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
        if (label[to] >= 0) done[to] = 1; // and, if it carries a job, finishes it
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
      for (let i = 0; i < COUNT; i++) {
        act[i] *= 0.93;
        done[i] *= 0.988;
      }
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
        `rgba(${Math.round(128 + g * 82)}, ${Math.round(160 + g * 66)}, ${Math.round(216 + g * 39)}, ${(
          0.16 + g * 0.6
        ).toFixed(3)})`,
      );
    }
    const bx: number[][] = Array.from({ length: LEVELS }, () => []);
    const by: number[][] = Array.from({ length: LEVELS }, () => []);

    const EDGE_STEPS = 3;
    const edgeStroke = [
      "rgba(132,164,224,0.32)",
      "rgba(124,154,212,0.18)",
      "rgba(116,144,200,0.085)",
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
    // A mask that erases the network from the column the hero text sits in.
    // Rebuilt only on resize; making a gradient every frame allocates.
    let guard: CanvasGradient | null = null;
    // Where the hero ends in document coordinates. Below it the page is text
    // from edge to edge, so the network is cut off there.
    let heroBottom = 800;

    function build() {
      // The field is soft dots and thin lines behind the page; it does not
      // need a retina buffer, and every pixel in it is a pixel the compositor
      // blends over the scrolling page on every frame.
      dpr = 1;
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = width < 760;
      focal = Math.min(width, height) * (narrow ? 0.8 : 1.0);
      const hero = document.querySelector<HTMLElement>(".hero");
      heroBottom = hero
        ? hero.offsetTop + hero.offsetHeight
        : Math.round(window.innerHeight * 0.85);
      // the fade to resting strength is over by the foot of the hero; the
      // flight itself has no end, it loops
      heroRun = Math.max(360, heroBottom - 140);
      // Solid across the text column, then a long ramp so there is no edge
      // to see. The paragraph runs wider than the headline, so the solid part
      // has to clear it too.
      guard = ctx!.createLinearGradient(0, 0, width * 0.74, 0);
      guard.addColorStop(0, "rgba(0,0,0,1)");
      guard.addColorStop(0.7, "rgba(0,0,0,1)");
      guard.addColorStop(1, "rgba(0,0,0,0)");
    }

    function readScroll() {
      const y = Math.max(0, window.scrollY);
      // The flight: eased over the first screen so the opening has some
      // punch, then linear, so the rest of the page advances at an even rate
      // instead of crawling to a stop.
      const opening = Math.min(1, y / heroRun);
      const eased = opening * opening * (3 - 2 * opening);
      let z = Z_START + (Z_DIVE - Z_START) * eased;
      if (y > heroRun) z -= (y - heroRun) * Z_PER_PX;
      // fold the travel back into one loop's worth
      if (z < LOOP_TOP) {
        const d = LOOP_TOP - z;
        z = LOOP_TOP - (d % LOOP_SPAN);
      }
      camZ = z;

      // The strength: full over the top half of the hero, down to REST by the
      // foot of it, and REST from there to the end of the page.
      const rest = narrow ? REST_NARROW : REST;
      const h = Math.max(0, y / heroRun);
      presence = h <= 0.45 ? 1 : Math.max(rest, 1 - ((h - 0.45) / 0.55) * (1 - rest));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalAlpha = presence;

      // On a wide screen the left half of the hero is the headline and the
      // price; the network sits in the right half, where the page has no
      // words, until the dive pulls it over everything.
      const drift = Math.min(1, Math.max(0, (camZ - Z_DIVE) / (Z_START - Z_DIVE)));
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

      // --- the jobs the network is closing ---
      //
      // This is the part that makes it read as artificial intelligence rather
      // than as a screensaver. A lattice of dots is a shape; a lattice whose
      // neurons carry "Weekly report", "Contract checked", "Email to a client"
      // and tick them off as the signal reaches them is the product. The
      // labels only exist near the camera, so they arrive as the reader flies
      // in and are gone once the network has receded behind the page.
      const words = tasksRef.current;
      if (words.length && presence > 0.35) {
        ctx!.textBaseline = "middle";
        ctx!.font =
          '10.5px ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, monospace';
        for (let i = 0; i < COUNT; i++) {
          const w = label[i];
          if (w < 0 || !sOk[i]) continue;
          // fade in as it comes close, out again once it is nearly past
          const near = sNear[i];
          const show = Math.min(1, Math.max(0, (near - 0.54) / 0.26));
          if (show <= 0.02) continue;
          const d = done[i];
          const x = sx[i] + 9;
          const y = sy[i];
          if (d > 0.04) {
            ctx!.fillStyle = `rgba(43,217,139,${(0.5 + d * 0.45).toFixed(3)})`;
            ctx!.fillText("\u2713", sx[i] - 16, y);
            ctx!.fillStyle = `rgba(214,240,228,${(show * (0.45 + d * 0.5)).toFixed(3)})`;
          } else {
            ctx!.fillStyle = `rgba(158,182,222,${(show * 0.42).toFixed(3)})`;
          }
          ctx!.fillText(words[w], x, y);
        }
      }

      // --- the signals themselves, the brightest thing on screen ---
      ctx!.fillStyle = "rgba(206,226,255,0.94)";
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

      // --- keep it off the words ---
      //
      // Measured over the built page: a signal passing behind the headline at
      // full strength took the contrast there to 1.7:1 and behind a paragraph
      // to 1.06:1 — the line vanishes into it. So wherever there are words,
      // the network is knocked down to REST, which is the strength measured
      // to leave even the page's faintest grey at 4.9:1.
      //
      // It is knocked down rather than cut, and that is the difference from
      // before: destination-out at a partial alpha thins the pixels instead
      // of removing them, so the network carries on behind the whole page
      // instead of stopping at the foot of the hero.
      const rest = narrow ? REST_NARROW : REST;
      const knock = presence > rest ? 1 - rest / presence : 0;

      if (knock > 0.004) {
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.globalAlpha = knock;

        // the hero's own text column, for as long as the hero is on screen
        if (guard && !narrow) {
          ctx!.fillStyle = guard;
          ctx!.fillRect(0, 0, width * 0.74, height);
        }

        // and everything below the hero, where the page is text edge to edge
        const cut = heroBottom - window.scrollY - 40;
        if (cut < height) {
          const top = Math.max(0, cut - 90);
          const fade = ctx!.createLinearGradient(0, top, 0, Math.max(top + 1, cut));
          fade.addColorStop(0, "rgba(0,0,0,0)");
          fade.addColorStop(1, "rgba(0,0,0,1)");
          ctx!.fillStyle = fade;
          ctx!.fillRect(0, top, width, height - top);
        }

        ctx!.globalCompositeOperation = "source-over";
      }
      ctx!.globalAlpha = presence;
    }

    // A full-viewport canvas over a scrolling page is what makes frames run
    // long — the compositor blends it on every scroll frame — and the only
    // lever is how often it is repainted. So: thirty frames a second over the
    // hero, where the dive is the thing being watched, and fifteen for the
    // rest of the page, where it is a slow drift behind the words and nobody
    // can tell. The camera still reads every scroll event either way, so the
    // flight tracks the wheel exactly however often it is drawn.
    let tick = 0;
    function loop() {
      frame = requestAnimationFrame(loop);
      tick++;
      const every = presence > 0.35 ? 2 : 4;
      if (tick % every) return;
      t += every * 16;
      step();
      draw();
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
