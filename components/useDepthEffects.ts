"use client";

import { useEffect } from "react";

/**
 * The motion layer: reveal on scroll, the pointer light, the tilting card
 * stack, counters, magnetic buttons and the hover glow. All of it is
 * additive — the page is complete and readable before this runs.
 */
export function useDepthEffects(lang: string) {
  useEffect(() => {
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

    // --- headings arrive word by word --------------------------------------
    const worded = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          worded.unobserve(entry.target);
        }
      },
      { rootMargin: "-60px 0px -12% 0px" },
    );
    document.querySelectorAll<HTMLElement>(".h2").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const words = (el.textContent ?? "").split(" ");
      el.textContent = "";
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        span.style.transitionDelay = `${i * 45}ms`;
        el.append(span, document.createTextNode(" "));
      });
      el.classList.add("split");
      worded.observe(el);
    });
    cleanups.push(() => worded.disconnect());

    // --- counters ---------------------------------------------------------
    const counted = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          counted.unobserve(el);

          const raw = el.dataset.value ?? "";
          const digits = raw.match(/^(\d+)(.*)$/);
          if (!digits) {
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
          const width = String(target).length;
          const step = (now: number) => {
            const p = Math.min(1, (now - started) / 1200);
            if (p < 0.55) {
              // scramble first, so the number feels calculated, not counted
              let noise = "";
              for (let d = 0; d < width; d++) {
                noise += String(Math.floor(Math.random() * 10));
              }
              el.textContent = noise + suffix;
            } else {
              const t = (p - 0.55) / 0.45;
              el.textContent =
                Math.round(target * (1 - (1 - t) ** 3)) + suffix;
            }
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
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
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      // moves the ambient light down the page, so each section arrives
      // into its own pool of light rather than the same flat ground
      document.documentElement.style.setProperty("--scene", String(p));
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

    // --- a ripple leaving the press ---------------------------------------
    // Delegated, so it covers buttons that mount later (the form swaps its
    // own out when a request is sent) without rebinding anything.
    {
      const onPress = (e: PointerEvent) => {
        const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn");
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const ink = document.createElement("span");
        ink.className = "ripple";
        ink.style.left = `${e.clientX - r.left}px`;
        ink.style.top = `${e.clientY - r.top}px`;
        ink.addEventListener("animationend", () => ink.remove());
        btn.appendChild(ink);
      };
      document.addEventListener("pointerdown", onPress);
      cleanups.push(() => document.removeEventListener("pointerdown", onPress));
    }

    // --- magnetic buttons -------------------------------------------------
    {
      const magnets = Array.from(document.querySelectorAll<HTMLElement>(".btn"));
      const onMagnet = (e: PointerEvent) => {
        for (const el of magnets) {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const reach = Math.max(r.width, 140);
          const dist = Math.hypot(dx, dy);
          if (dist < reach) {
            const pull = (1 - dist / reach) * 0.32;
            el.style.setProperty("--tx", `${dx * pull}px`);
            el.style.setProperty("--ty", `${dy * pull}px`);
          } else if (el.style.getPropertyValue("--tx") !== "0px") {
            el.style.setProperty("--tx", "0px");
            el.style.setProperty("--ty", "0px");
          }
        }
      };
      window.addEventListener("pointermove", onMagnet, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onMagnet));
    }

    // --- tilting card stack -----------------------------------------------
    {
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
 * Types the request out character by character, shows the answer, pauses,
 * and starts over. Drives the nodes directly, so React never re-renders on
 * every keystroke.
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
