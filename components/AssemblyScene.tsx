"use client";

import { useEffect, useRef } from "react";

/**
 * The pinned scene: the page holds still while the reader scrolls, and one
 * setup after another drops onto the stack until all nine are there. It is
 * the argument of the course made physical — four weeks, nine setups.
 *
 * Progress is read straight from the scroll position rather than from a
 * library, so it stays exact when the reader scrubs back and forth.
 */
export default function AssemblyScene({
  eyebrow,
  title,
  note,
  items,
  counterLabel,
}: {
  eyebrow: string;
  title: string;
  note: string;
  items: readonly string[];
  counterLabel: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = wrap.current;
    const board = stage.current;
    if (!section || !board) return;

    const cards = Array.from(board.querySelectorAll<HTMLElement>(".sc-card"));

    let frame = 0;
    let shown = -1;

    const render = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

      // the last fifth is a hold, so the finished stack is readable
      const eased = Math.min(1, p / 0.82);
      const landed = eased * cards.length;

      cards.forEach((card, i) => {
        const local = Math.min(1, Math.max(0, landed - i));
        const drop = 1 - local;
        // the incoming card turns solid almost at once, so it covers the
        // stack it is landing on instead of ghosting through it
        card.style.opacity = String(Math.min(1, local * 6));
        card.style.transform =
          `translateY(${-i * 52 + drop * 150}px) ` +
          `translateX(${drop * 38}px) ` +
          `scale(${(1 - i * 0.012) * (0.94 + local * 0.06)}) ` +
          `rotate(${drop * 5}deg)`;
        // older cards recede so the newest one reads as the live layer
        card.style.filter = `brightness(${0.6 + Math.min(0.4, local * 0.4)})`;
        card.classList.toggle("is-top", Math.floor(landed) === i + 1);
      });

      const done = Math.min(cards.length, Math.round(landed));
      if (done !== shown && count.current) {
        shown = done;
        count.current.textContent = String(done);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <section className="scene" ref={wrap}>
      <div className="scene-pin">
        <div className="shell scene-in">
          <div className="scene-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="h2">{title}</h2>
            <p className="lede">{note}</p>
            <p className="scene-count">
              <span ref={count}>0</span>
              <i>/ {items.length}</i>
              <em>{counterLabel}</em>
            </p>
          </div>

          <div className="scene-stage" ref={stage} aria-hidden="true">
            {items.map((label, i) => (
              <div className="sc-card" key={label} style={{ zIndex: i + 1 }}>
                <span className="sc-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="sc-t">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
