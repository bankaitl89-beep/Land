"use client";

import { useState } from "react";
import type { Copy, Lang } from "@/lib/content";

type Props = {
  copy: Copy["form"];
  lang: Lang;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LeadForm({ copy, lang }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), lang }),
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
          className="btn btn--primary btn--wide"
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
