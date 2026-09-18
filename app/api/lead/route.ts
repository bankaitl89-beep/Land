import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Lead = {
  name?: unknown;
  email?: unknown;
  lang?: unknown;
  company?: unknown;
  tier?: unknown;
  tierName?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Telegram can be slow or unreachable; without a deadline the request just
// hangs and the visitor watches a spinner until the platform gives up.
const TELEGRAM_TIMEOUT_MS = 10_000;

// A lead is the only thing this page is for, so the endpoint is worth
// protecting from someone hammering it: six a minute per address is far more
// than a person needs and far less than a flood.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * If Telegram cannot be reached the lead would otherwise be gone for good, so
 * it goes to the server log where it can still be picked up by hand. Losing a
 * buyer costs more than the line of personal data this leaves behind.
 */
function logUndelivered(name: string, email: string, lang: string) {
  console.error(
    `lead: UNDELIVERED — recover manually: name=${JSON.stringify(name)} email=${JSON.stringify(email)} lang=${lang}`,
  );
}

export async function POST(request: Request) {
  let body: Lead;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // A field no human ever sees and no human ever fills. Bots fill everything.
  if (clean(body.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const lang = clean(body.lang, 8) || "en";
  // Which pricing option was chosen. A request that does not say what the
  // person wanted to buy is half a request.
  const tier = clean(body.tierName, 80) || clean(body.tier, 40);

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("lead: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured");
    return NextResponse.json({ error: "Lead delivery is not configured." }, { status: 500 });
  }

  const text = [
    "<b>New request — Prompta aut perire</b>",
    "",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Page language:</b> ${escapeHtml(lang)}`,
    ...(tier ? [`<b>Option:</b> ${escapeHtml(tier)}`] : []),
    `<b>Received:</b> ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("lead: telegram rejected the message", res.status, detail);
      logUndelivered(name, email, lang);
      return NextResponse.json({ error: "Could not deliver the request." }, { status: 502 });
    }
  } catch (err) {
    console.error("lead: telegram request failed", err);
    logUndelivered(name, email, lang);
    return NextResponse.json({ error: "Could not deliver the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
