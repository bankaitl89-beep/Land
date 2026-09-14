"use client";

import { useEffect } from "react";

/**
 * The motion layer: reveal on scroll, the pointer light, the tilting card
 * stack, counters and the hover glow. All of it is additive — the page is
 * fully readable before this runs, and it stands down for anyone who asked
 * their system for reduced motion.
 */
export function useDepthEffects(lang: string) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("anim");

    const cleanups: Array<() => void> = [];

    // --- reveal on scroll -------------------------------------------------
    const revealed = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          revealed.unobserve(entry.target);
        }
      },
      { rootMargin: "-40px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>(".rv").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      revealed.observe(el);
    });
    // Nothing may stay invisible: if an element never crosses the observer
    // (short viewport, restored scroll position), show it anyway.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll(".rv:not(.in)").forEach((el) => el.classList.add("in"));
    }, 3000);
    cleanups.push(() => {
      revealed.disconnect();
      window.clearTimeout(failsafe);
    });

    // --- counters ---------------------------------------------------------
    const counted = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          counted.unobserve(el);

          const raw = el.dataset.value ?? "";
          const digits = raw.match(/^(\d+)(.*)$/);
          if (!digits || reduce) {
            el.textContent = raw;
            continue;
          }
          const target = Number(digits[1]);
          const suffix = digits[2];
          if (target === 0) {
            el.textContent = raw;
            continue;
          }
          const started = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - started) / 1100);
            el.textContent = Math.round(target * (1 - (1 - p) ** 3)) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { rootMargin: "-40px" },
    );
    document.querySelectorAll<HTMLElement>("[data-value]").forEach((el) => {
      el.textContent = "0";
      counted.observe(el);
    });
    cleanups.push(() => counted.disconnect());

    // --- scroll progress --------------------------------------------------
    const bar = document.getElementById("progress");
    const onScroll = () => {
      if (!bar) return;
      const max = document.body.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // --- pointer light + local glows --------------------------------------
    let targetX = 0.5;
    let targetY = 0.2;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
      const root = document.documentElement;
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        ".skill, .btn--acc",
      );
      if (el) {
        const r = el.getBoundingClientRect();
        const prefix = el.classList.contains("skill") ? "s" : "b";
        el.style.setProperty(`--${prefix}x`, `${e.clientX - r.left}px`);
        el.style.setProperty(`--${prefix}y`, `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    cleanups.push(() => window.removeEventListener("pointermove", onMove));

    // --- tilting card stack -----------------------------------------------
    if (!reduce) {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".card"));
      if (cards.length) {
        let x = 0.5;
        let y = 0.2;
        let frame = 0;
        const loop = () => {
          x += (targetX - x) * 0.06;
          y += (targetY - y) * 0.06;
          const ry = (x - 0.5) * 22;
          const rx = (0.5 - y) * 15;
          const spread = Math.min(1, window.scrollY / 520);
          cards.forEach((card, i) => {
            const depth = 0.6 + i * 0.3;
            const fan = (cards.length - 1 - i) * spread;
            card.style.transform =
              `rotateX(${rx * depth}deg) rotateY(${ry * depth}deg) ` +
              `translateZ(${i * 26}px) translateY(${fan * -26}px) ` +
              `translateX(${fan * 16}px) rotate(${fan * -2.2}deg)`;
          });
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
        cleanups.push(() => cancelAnimationFrame(frame));
      }
    }

    return () => cleanups.forEach((fn) => fn());
    // Re-run per language: the DOM is rebuilt, so observers need re-attaching.
  }, [lang]);
}

/**
 * Types the request out character by character, then shows the answer,
 * pauses, and starts over. Returns nothing — it drives the given nodes
 * directly so React never re-renders on every keystroke.
 */
export function useTypewriter(
  askId: string,
  outId: string,
  lines: readonly string[],
) {
  useEffect(() => {
    const ask = document.getElementById(askId);
    const out = document.getElementById(outId);
    if (!ask || !out) return;

    const caret = '<span class="cur"></span>';
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      ask.textContent = lines.join(" ");
      out.classList.add("on");
      return;
    }

    let line = 0;
    let chars = 0;
    let timer = 0;

    const tick = () => {
      if (line >= lines.length) {
        out.classList.add("on");
        timer = window.setTimeout(() => {
          out.classList.remove("on");
          line = 0;
          chars = 0;
          ask.innerHTML = caret;
          timer = window.setTimeout(tick, 800);
        }, 4600);
        return;
      }
      chars++;
      const done = lines.slice(0, line).join("<br>");
      ask.innerHTML =
        (done ? `${done}<br>` : "") + lines[line].slice(0, chars) + caret;

      if (chars >= lines[line].length) {
        line++;
        chars = 0;
        timer = window.setTimeout(tick, 280);
      } else {
        timer = window.setTimeout(tick, 27);
      }
    };

    ask.innerHTML = caret;
    timer = window.setTimeout(tick, 900);
    return () => window.clearTimeout(timer);
  }, [askId, outId, lines]);
}
