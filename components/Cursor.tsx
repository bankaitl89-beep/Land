"use client";

import { useEffect } from "react";

/**
 * A ring that trails the pointer and swells over anything clickable. Pointer
 * devices only — it never appears on touch, where there is no cursor to
 * augment, and it is decorative: the real cursor stays visible under it.
 */
export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = document.createElement("div");
    ring.className = "ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    document.body.classList.add("has-ring");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const hot = (e.target as HTMLElement | null)?.closest(
        "a, button, .skill, .mod, .pain, .tab, input",
      );
      ring.classList.toggle("is-hot", !!hot);
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      ring.remove();
      document.body.classList.remove("has-ring");
    };
  }, []);

  return null;
}
