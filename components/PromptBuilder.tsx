"use client";

import { useState } from "react";
import type { content } from "@/lib/content";

type Copy = (typeof content)["en"]["builder"];

/* The one thing on the page the visitor does rather than reads.
   It answers three questions in order, because the first version answered
   none of them and read as a pile of labelled fragments: what is the problem,
   what exactly do you paste into the chat, and what comes back.
   The three prepared jobs carry a real answer each. Anything typed by hand
   gets the same request built around those words and, instead of an invented
   answer, the shape the answer will take — which is true whatever the job,
   and is the one thing here that must not be made up. */
export default function PromptBuilder({ c }: { c: Copy }) {
  const [job, setJob] = useState("");
  const [copied, setCopied] = useState(false);

  const clean = job.trim();
  const built = clean.length > 0;
  const picked = c.cases.find(
    (k) => k.chip.toLowerCase() === clean.toLowerCase(),
  );
  const shown = picked ?? c.generic;
  const ask = shown.ask.map((line) => line.replace("{job}", clean));
  // the line that states the job, so it can be marked as the visitor's own —
  // the token for anything typed by hand, the second line in a prepared one
  const mine = picked ? 1 : shown.ask.findIndex((l) => l.includes("{job}"));

  async function copy() {
    try {
      await navigator.clipboard.writeText(ask.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no clipboard permission — the text is on screen to select by hand */
    }
  }

  function pick(sample: string) {
    setJob(sample);
    setCopied(false);
  }

  return (
    <div className="bld">
      <div className="bld-in">
        <label className="bld-lbl" htmlFor="bld-job">
          {c.label}
        </label>
        <div className="bld-entry">
          <span aria-hidden="true">{"›"}</span>
          <input
            id="bld-job"
            type="text"
            value={job}
            maxLength={120}
            autoComplete="off"
            placeholder={c.placeholder}
            onChange={(e) => {
              setJob(e.target.value);
              setCopied(false);
            }}
          />
        </div>

        <p className="bld-samples-lbl">{c.samplesLabel}</p>
        <div className="bld-samples">
          {c.cases.map((k) => (
            <button
              key={k.chip}
              type="button"
              onClick={() => pick(k.chip)}
              aria-pressed={picked?.chip === k.chip}
            >
              {k.chip}
            </button>
          ))}
        </div>

        <div className="bld-naive">
          <p className="bld-cap">{c.naiveLabel}</p>
          <p className="bld-naive-line">
            {built ? clean : c.placeholder}
            <i aria-hidden="true" />
          </p>
        </div>
      </div>

      <div className="bld-out" data-built={built}>
        <p className="bld-cap bld-cap--out">{c.builtLabel}</p>
        <p className="bld-empty" data-built={built}>
          {c.empty}
        </p>

        {/* the whole scaffold stays on screen, dimmed, until there is a real
            job to drop into it, so the panel never changes height and the
            visitor can see what they are about to get */}
        <div className="bld-steps" data-built={built}>
          <section className="bld-step" style={{ "--i": 0 } as React.CSSProperties}>
            <h3>
              <b>1</b>
              {c.problemLabel}
            </h3>
            <p className="bld-problem">{shown.problem}</p>
          </section>

          <section className="bld-step" style={{ "--i": 1 } as React.CSSProperties}>
            <h3>
              <b>2</b>
              {c.askLabel}
            </h3>
            <div className="bld-ask">
              {ask.map((line, i) => (
                <p key={line} className={i === mine ? "is-mine" : undefined}>
                  {line}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--ghost bld-copy"
              onClick={copy}
              disabled={!built}
            >
              {copied ? c.copied : c.copy}
            </button>
          </section>

          <section className="bld-step" style={{ "--i": 2 } as React.CSSProperties}>
            <h3>
              <b>3</b>
              {c.outLabel}
            </h3>
            <ul className="bld-res">
              {shown.out.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="bld-win">{shown.win}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
