// Cloudflare Worker for NARLI DIGITAL mail:
// - fetch: the request forms, POST https://www.narli-digital.de/api/contact. Checks the request,
//   filters bots, limits requests per IP and sends the message as an e-mail via Cloudflare Email
//   Routing to our inbox. Form messages are not stored. Personal data is never logged.
// - email: incoming mail for info@ (forward; keep what the inbox refuses, see inbox.js).
import { EmailMessage } from "cloudflare:email";
import { handleIncoming } from "./inbox.js";
import { buildEmail, looksLikeBot, validate } from "./message.js";

const ALLOWED_ORIGINS = new Set(["https://www.narli-digital.de", "https://narli-digital.de"]);
const MAX_BYTES = 20_000;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, { Allow: "POST" });
    if (!ALLOWED_ORIGINS.has(request.headers.get("Origin"))) return json({ ok: false, error: "origin" }, 403);
    if (!(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "type" }, 415);
    }
    if (Number(request.headers.get("Content-Length") || 0) > MAX_BYTES) return json({ ok: false, error: "size" }, 413);

    const text = await request.text();
    if (text.length > MAX_BYTES) return json({ ok: false, error: "size" }, 413);
    let input;
    try {
      input = JSON.parse(text);
    } catch {
      return json({ ok: false, error: "json" }, 400);
    }

    // Bots get a normal "ok" so they have nothing to learn from; nothing is sent.
    if (looksLikeBot(input)) return json({ ok: true });

    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") || "unknown" });
      if (!success) return json({ ok: false, error: "rate" }, 429);
    }

    const { form, errors } = validate(input);
    if (errors.length) return json({ ok: false, error: "invalid", fields: errors }, 422);
    if (!env.CONTACT_TO || !env.CONTACT_FROM) return json({ ok: false, error: "config" }, 500);

    try {
      const raw = buildEmail({ form, from: env.CONTACT_FROM, to: env.CONTACT_TO });
      await env.MAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
    } catch (error) {
      console.error("contact form: sending failed:", error?.message || String(error));
      return json({ ok: false, error: "send" }, 502);
    }
    return json({ ok: true });
  },

  async email(message, env) {
    await handleIncoming(message, env, { EmailMessage });
  },
};
