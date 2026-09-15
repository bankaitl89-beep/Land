"use client";

import { useState } from "react";
import type { content } from "@/lib/content";

type Copy = (typeof content)["en"]["builder"];

/* The one thing on the page the visitor does rather than reads.
   They type the job they actually have, in their own words, and watch it get
   wrapped in the four things the course says a request needs: who is reading,
   what to work from, what shape the answer takes, and how it gets judged.
   Nothing is generated and nothing is sent anywhere — the scaffold is the
   course's own, and their words drop into the one slot that is theirs. */
export default function PromptBuilder({ c }: { c: Copy }) {
  const [job, setJob] = useState("");
  const [copied, setCopied] = useState(false);
  const clean = job.trim();
  const built = clean.length > 0;

  const [who, source, shape, judge] = c.blocks;
  const lines = [
    who.text,
    `${c.jobPrefix} ${clean}`,
    source.text,
    shape.text,
    judge.text,
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
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
          {c.samples.map((s) => (
            <button key={s} type="button" onClick={() => pick(s)}>
              {s}
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

        {/* the scaffold is always on screen — dimmed until there is a real
            job to drop into it, so the panel never changes height and the
            visitor can see what they are about to get */}
        <ol className="bld-blocks" data-built={built}>
          <li style={{ "--i": 0 } as React.CSSProperties}>
            <span>{who.label}</span>
            <p>{who.text}</p>
          </li>
          <li className="is-yours" style={{ "--i": 1 } as React.CSSProperties}>
            <span>{c.jobLabel}</span>
            <p>
              {c.jobPrefix} {built ? clean : c.placeholder}
            </p>
          </li>
          {[source, shape, judge].map((b, i) => (
            <li key={b.label} style={{ "--i": i + 2 } as React.CSSProperties}>
              <span>{b.label}</span>
              <p>{b.text}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="btn btn--ghost bld-copy"
          onClick={copy}
          disabled={!built}
        >
          {copied ? c.copied : c.copy}
        </button>
      </div>
    </div>
  );
}
