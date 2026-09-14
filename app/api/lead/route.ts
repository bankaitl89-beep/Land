import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Lead = {
  name?: unknown;
  email?: unknown;
  lang?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  let body: Lead;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const lang = clean(body.lang, 8) || "en";

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
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("lead: telegram rejected the message", res.status, detail);
      return NextResponse.json({ error: "Could not deliver the request." }, { status: 502 });
    }
  } catch (err) {
    console.error("lead: telegram request failed", err);
    return NextResponse.json({ error: "Could not deliver the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
