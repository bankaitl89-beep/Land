"use client";

import { useState } from "react";
import type { Copy, Lang } from "@/lib/content";

type Props = {
  copy: Copy["form"];
  lang: Lang;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Where a lead goes.
 *
 * Unset — the default — and it goes to this project's own /api/lead, which
 * needs a server and forwards to Telegram. Set it to a form service's URL and
 * the page posts straight there instead, which is what lets the whole landing
 * ship as static files: no server of ours, no secret in the page.
 *
 * NEXT_PUBLIC_LEAD_EXTRA is merged into the body, for services that want a
 * key alongside the fields (Web3Forms calls it access_key). Those keys are
 * public by design — they only permit delivery to the address that owns them.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "/api/lead";
let EXTRA: Record<string, string> = {};
try {
  EXTRA = JSON.parse(process.env.NEXT_PUBLIC_LEAD_EXTRA || "{}");
} catch {
  /* a malformed value must not take the form down with it */
}

export default function LeadForm({ copy, lang }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // the honeypot: hidden from people, irresistible to bots
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; send?: string }>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = copy.errName;
    if (!EMAIL_RE.test(email.trim())) next.email = copy.errEmail;
    setErrors(next);
    if (next.name || next.email) return;

    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...EXTRA,
          name: name.trim(),
          email: email.trim(),
          lang,
          page: typeof location === "undefined" ? "" : location.href,
          company,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setState("sent");
    } catch {
      setState("idle");
      setErrors({ send: copy.errSend });
    }
  }

  if (state === "sent") {
    return (
      <div className="sent">
        <div className="sent-mark" aria-hidden="true">
          ✓
        </div>
        <h3 className="h3">{copy.success}</h3>
        <p>{copy.successSub}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="trap" aria-hidden="true">
        <label htmlFor="lead-company">Company</label>
        <input
          id="lead-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="lead-name">{copy.name}</label>
        <input
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={copy.namePh}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "lead-name-err" : undefined}
        />
        {errors.name && (
          <p className="err" id="lead-name-err">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="lead-email">{copy.email}</label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPh}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "lead-email-err" : undefined}
        />
        {errors.email && (
          <p className="err" id="lead-email-err">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <button
          type="submit"
          className="btn btn--acc btn--wide"
          disabled={state === "sending"}
        >
          {state === "sending" ? copy.sending : copy.submit}
        </button>
        {errors.send && <p className="err">{errors.send}</p>}
      </div>

      <p className="form-foot">{copy.privacy}</p>
    </form>
  );
}
