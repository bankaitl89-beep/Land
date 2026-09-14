"use client";

import { useEffect, useRef } from "react";

/**
 * The headline types itself out, accent phrase and all. The full text is
 * rendered on the server, so search engines and anyone without JavaScript
 * get the finished sentence; the effect only replays it.
 */
export default function TypedHeading({
  parts,
}: {
  /** [lead, before, accent, tail] — the accent segment is styled apart. */
  parts: readonly string[];
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [lead, before, accent, tail] = parts;
    const plain = `${lead}\n${before}`;
    const rest = `${accent}${tail}`;

    let i = 0;
    let timer = 0;

    const paint = () => {
      const typedPlain = plain.slice(0, Math.min(i, plain.length));
      const typedRest = i > plain.length ? rest.slice(0, i - plain.length) : "";
      const done = i >= plain.length + rest.length;

      el.innerHTML =
        typedPlain.replace("\n", "<br>") +
        (typedRest ? `<span class="grad">${typedRest}</span>` : "") +
        (done ? "" : '<span class="type-cur"></span>');
    };

    const step = () => {
      i++;
      paint();
      if (i >= plain.length + rest.length) return;
      // a hair slower over the accent phrase, so the eye lands on it
      const pace = i > plain.length ? 44 : 26;
      timer = window.setTimeout(step, pace);
    };

    el.innerHTML = '<span class="type-cur"></span>';
    timer = window.setTimeout(step, 450);

    return () => window.clearTimeout(timer);
  }, [parts]);

  return (
    <h1 ref={ref} className="typed">
      {parts[0]}
      <br />
      {parts[1]}
      <span className="grad">{parts[2]}</span>
      {parts[3]}
    </h1>
  );
}
