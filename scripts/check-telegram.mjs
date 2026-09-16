// Answers one question: do leads actually arrive in Telegram?
//
// Run it on a machine that can reach the internet — this repo's sandbox
// cannot, so the answer has never been checked from there:
//
//   node --env-file=.env.local scripts/check-telegram.mjs
//
// It reads the same two variables the API route reads, asks Telegram who the
// bot is, and sends one real message to the configured chat. The token is
// never printed.

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const fail = (msg, hint) => {
  console.error(`\n  ✗ ${msg}`);
  if (hint) console.error(`    ${hint}`);
  process.exit(1);
};

if (!token || !chatId) {
  fail(
    "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.",
    "Run it with:  node --env-file=.env.local scripts/check-telegram.mjs",
  );
}

async function call(method, body) {
  let res;
  try {
    res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    fail(
      `Could not reach api.telegram.org (${err.name}).`,
      "No route to Telegram from this machine — a firewall, a proxy, or the country blocking it.",
    );
  }
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* not Telegram's JSON */ }

  // Telegram always answers with {"ok":...}. Anything else on the wire is
  // something in between — a corporate proxy, a captive portal, a country
  // block — and saying "your token is wrong" there would be a lie.
  if (!data || typeof data.ok !== "boolean") {
    fail(
      `Something between you and Telegram answered with HTTP ${res.status}, not Telegram itself.`,
      `A proxy or a network block, not the bot. First 120 characters of what came back: ${text.slice(0, 120).replace(/\s+/g, " ")}`,
    );
  }
  return { ok: res.ok && data.ok, status: res.status, data };
}

const me = await call("getMe");
if (!me.ok) {
  fail(
    `Telegram rejected the token (HTTP ${me.status}: ${me.data.description ?? "no detail"}).`,
    "The token in .env.local is wrong or the bot was deleted. Get a new one from @BotFather.",
  );
}
console.log(`\n  ✓ Token works. Bot: @${me.data.result.username}`);

/* Whoever has written to the bot in the last 24 hours shows up here, with the
   id that TELEGRAM_CHAT_ID is supposed to be. It is the only way to find that
   number without guessing, and a wrong one is the usual reason a bot that is
   otherwise fine delivers nothing. Reading updates does not consume them —
   they are only cleared by confirming a higher offset, which this never does. */
async function knownChats() {
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`, {
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (!data?.ok) return null; // a webhook is set (409), or nothing to read
  const seen = new Map();
  for (const u of data.result) {
    const c = (u.message ?? u.channel_post ?? u.my_chat_member)?.chat;
    if (c) seen.set(String(c.id), c.title ?? [c.first_name, c.last_name].filter(Boolean).join(" ") ?? c.username ?? "");
  }
  return seen;
}

const chats = await knownChats();
if (chats?.size) {
  console.log("\n    Chats that have written to this bot recently:");
  for (const [id, who] of chats) {
    const mark = id === String(chatId) ? "  ← your TELEGRAM_CHAT_ID" : "";
    console.log(`      ${id}${who ? `  (${who})` : ""}${mark}`);
  }
  if (!chats.has(String(chatId))) {
    console.log(`\n    TELEGRAM_CHAT_ID is ${chatId}, which is not among them.`);
    console.log("    If the send below fails, one of the ids above is the right value.");
  }
}

const sent = await call("sendMessage", {
  chat_id: chatId,
  text: "<b>Prompta aut perire</b>\nDelivery check — if you are reading this, leads will arrive here.",
  parse_mode: "HTML",
  disable_web_page_preview: true,
});

if (!sent.ok) {
  const d = sent.data.description ?? "no detail";
  const hint =
    /chat not found/i.test(d)
      ? "TELEGRAM_CHAT_ID does not match a chat this bot can see. For a personal chat it is your own user id; for a group it starts with a minus."
      : /bot can't initiate|blocked|not enough rights/i.test(d)
        ? `Open Telegram, find @${me.data.result.username}, and press Start. A bot cannot message someone who has never written to it.`
        : "";
  fail(`Telegram accepted the token but refused to send (HTTP ${sent.status}: ${d}).`, hint);
}

console.log(`  ✓ Message delivered to chat ${chatId}. Check Telegram.\n`);
