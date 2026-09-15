"use client";

import { useEffect, useRef } from "react";

/**
 * The opening dive.
 *
 * A sphere of points hangs in front of the reader; as they scroll, the camera
 * flies into it, through the shell, and out the far side, so the first stretch
 * of the page is a descent into the field rather than a scroll past a
 * background. By the time the page settles the reader is inside it, and the
 * field keeps drifting behind every section after that.
 *
 * The reference for this effect scrubs three hundred pre-rendered frames —
 * twelve megabytes, decoded and held in memory, because its subject is footage
 * of a car. A sphere is not footage: it is arithmetic, so it is computed per
 * frame instead. Nothing is downloaded, nothing waits to load, and it is sharp
 * at any pixel density.
 *
 * What keeps it at frame rate is batching. Points are sorted into brightness
 * buckets and each bucket is filled in one path, so a couple of thousand
 * points cost a dozen draw calls rather than a couple of thousand.
 */
export default function SphereField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Three nested shells read as a solid object from outside and as depth
    // once the camera is within them.
    const SHELLS = [
      { n: 620, r: 1 },
      { n: 420, r: 0.74 },
      { n: 260, r: 0.45 },
    ];
    const COUNT = SHELLS.reduce((sum, s) => sum + s.n, 0);

    // The camera starts well outside the sphere and ends well past its centre.
    const Z_START = 3.05;
    const Z_END = 0.15;
    // How much of the page the dive is spread over, in screen heights.
    const DIVE_SCREENS = 2.4;

    const LEVELS = 9;
    const fills: string[] = [];
    const radii: number[] = [];
    for (let i = 0; i < LEVELS; i++) {
      const g = i / (LEVELS - 1);
      radii.push(0.8 + g * 3.1);
      fills.push(
        i === 0
          ? "rgba(188,196,255,0.16)"
          : `rgba(${Math.round(122 + g * 44)}, ${Math.round(132 + g * 38)}, 255, ${(
              0.2 +
              g * 0.66
            ).toFixed(3)})`,
      );
    }
    const bucketX: number[][] = Array.from({ length: LEVELS }, () => []);
    const bucketY: number[][] = Array.from({ length: LEVELS }, () => []);

    // unit positions, fixed for the life of the field
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const pz = new Float32Array(COUNT);
    {
      // a Fibonacci lattice spreads points evenly over a sphere, where the
      // obvious latitude/longitude grid would crowd them at the poles
      const golden = Math.PI * (3 - Math.sqrt(5));
      let k = 0;
      for (const shell of SHELLS) {
        for (let i = 0; i < shell.n; i++) {
          const y = 1 - (i / (shell.n - 1)) * 2;
          const rad = Math.sqrt(Math.max(0, 1 - y * y));
          const theta = golden * i;
          px[k] = Math.cos(theta) * rad * shell.r;
          py[k] = y * shell.r;
          pz[k] = Math.sin(theta) * rad * shell.r;
          k++;
        }
      }
    }

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
    // On a phone the hero fills the screen and there is no empty half for the
    // sphere to sit in, so it drops below the copy and reads as atmosphere
    // rather than competing with the words.
    let narrow = false;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = width < 760;
      // the sphere should read at the same size whatever the window
      focal = Math.min(width, height) * (narrow ? 0.78 : 0.95);
    }

    function readScroll() {
      const runway = window.innerHeight * DIVE_SCREENS;
      const raw = Math.max(0, window.scrollY / runway);
      const p = Math.min(1, raw);
      // ease so the approach is slow and the passage through the shell is fast
      const eased = p * p * (3 - 2 * p);
      camZ = Z_START + (Z_END - Z_START) * eased;

      // The dive is the event; once it is over the field has to get out of
      // the way, because inside the sphere the points sit right on top of the
      // words. It recedes over the screen that follows and stays there.
      presence = raw <= 1 ? 1 : Math.max(0.3, 1 - (raw - 1) * 1.1);
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalAlpha = narrow ? presence * 0.5 : presence;

      const cx = width / 2;
      const cy = height * (narrow ? 0.66 : 0.47);

      // a slow turn, plus the lean the pointer asks for
      tiltX += (wantTiltX - tiltX) * 0.06;
      tiltY += (wantTiltY - tiltY) * 0.06;
      const ay = t * 0.00012 + tiltY;
      const ax = Math.sin(t * 0.00009) * 0.12 + tiltX;
      const sinY = Math.sin(ay);
      const cosY = Math.cos(ay);
      const sinX = Math.sin(ax);
      const cosX = Math.cos(ax);

      for (let i = 0; i < LEVELS; i++) {
        bucketX[i].length = 0;
        bucketY[i].length = 0;
      }

      for (let i = 0; i < COUNT; i++) {
        const x0 = px[i];
        const y0 = py[i];
        const z0 = pz[i];

        // yaw then pitch
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = z0 * cosY - x0 * sinY;
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = z1 * cosX + y0 * sinX;

        // the camera sits on the +z axis looking back toward the origin, so
        // what is in front of it is whatever has a smaller z than it does
        const depth = camZ - z2;
        // behind the lens, or so close it would smear across the screen
        if (depth < 0.06) continue;

        const k = focal / depth;
        const sx = cx + x1 * k;
        const sy = cy + y2 * k;
        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) continue;

        // Brightness by distance. The range is set by where the camera
        // actually is: at the top of the page the sphere sits between two and
        // four units away, so the falloff has to still have most of its
        // travel left at four, or the whole object renders at the dimmest
        // step and disappears.
        const near = Math.min(1, Math.max(0, 1 - (depth - 0.15) / 4.4));
        const level = Math.min(LEVELS - 1, (near * (LEVELS - 1) + 0.5) | 0);
        bucketX[level].push(sx);
        bucketY[level].push(sy);
      }

      // the resting layer reads the same as a circle at this size and costs
      // a fraction of an arc
      const bx0 = bucketX[0];
      const by0 = bucketY[0];
      if (bx0.length) {
        ctx!.fillStyle = fills[0];
        ctx!.beginPath();
        for (let i = 0; i < bx0.length; i++) {
          ctx!.rect(bx0[i] - 0.7, by0[i] - 0.7, 1.4, 1.4);
        }
        ctx!.fill();
      }

      for (let l = 1; l < LEVELS; l++) {
        const bx = bucketX[l];
        if (!bx.length) continue;
        const by = bucketY[l];
        const r = radii[l];
        ctx!.fillStyle = fills[l];
        ctx!.beginPath();
        for (let i = 0; i < bx.length; i++) {
          ctx!.moveTo(bx[i] + r, by[i]);
          ctx!.arc(bx[i], by[i], r, 0, Math.PI * 2);
        }
        ctx!.fill();
      }
    }

    function loop() {
      t += 16;
      draw();
      frame = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      wantTiltY = (e.clientX / window.innerWidth - 0.5) * 0.5;
      wantTiltX = (e.clientY / window.innerHeight - 0.5) * 0.32;
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
