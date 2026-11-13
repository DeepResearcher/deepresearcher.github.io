// Incoming mail for info@narli-digital.de (Email Routing rule "Send to a Worker").
//
// Every message is forwarded to the inbox (CONTACT_TO) as before. If the inbox refuses it (Gmail
// rejects forwarded mail from senders without SPF/DKIM/DMARC with 550 5.7.1), the message is not
// lost: the original is kept for 90 days in Workers KV (binding UNDELIVERED) and a notice with the
// original attached goes to the inbox from our own, authenticated address. At most one notice per
// sender and subject per day, so a sender who retries all day does not flood the inbox.
// No Cloudflare imports in here (EmailMessage is passed in), so Node tests can run it with fakes.
import { base64, base64Bytes, encodeHeader, isEmail } from "./message.js";

export const KEEP_SECONDS = 90 * 24 * 60 * 60;
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const encoder = new TextEncoder();

const oneLine = (value, max) => String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

async function sha256Hex(bytes) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleIncoming(message, env, { EmailMessage, now = new Date() }) {
  // Read the original first, so it is still available if forwarding fails.
  const raw = new Uint8Array(await new Response(message.raw).arrayBuffer());

  let reason;
  try {
    await message.forward(env.CONTACT_TO);
    return "forwarded";
  } catch (error) {
    reason = oneLine(error?.message || error, 300) || "unknown error";
  }

  const info = {
    from: oneLine(message.from, 200),
    to: oneLine(message.to, 120),
    subject: oneLine(message.headers?.get?.("subject"), 150),
    date: oneLine(message.headers?.get?.("date"), 60),
    size: raw.byteLength,
    reason: reason.slice(0, 150),
  };

  // 1. Keep the original.
  const key = `msg:${now.toISOString()}:${(await sha256Hex(raw)).slice(0, 16)}`;
  let stored = false;
  if (env.UNDELIVERED) {
    try {
      await env.UNDELIVERED.put(key, raw, { expirationTtl: KEEP_SECONDS, metadata: info });
      stored = true;
    } catch {
      stored = false;
    }
  }

  // 2. Tell the inbox, once per sender and subject per day.
  const noticeKey = `notice:${now.toISOString().slice(0, 10)}:${(await sha256Hex(encoder.encode(`${info.from}\n${info.subject}`))).slice(0, 16)}`;
  let alreadyNoticed = false;
  if (env.UNDELIVERED) {
    try {
      alreadyNoticed = Boolean(await env.UNDELIVERED.get(noticeKey));
    } catch {
      alreadyNoticed = false;
    }
  }
  let noticed = false;
  if (!alreadyNoticed) {
    try {
      const mime = buildNotice({ info, raw, key: stored ? key : null, from: env.CONTACT_FROM, to: env.CONTACT_TO, now, reason });
      await env.MAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, mime));
      noticed = true;
      if (env.UNDELIVERED) await env.UNDELIVERED.put(noticeKey, "1", { expirationTtl: 2 * 24 * 60 * 60 }).catch(() => {});
    } catch {
      noticed = false;
    }
  }

  // 3. Neither kept nor reported: refuse, so the sender at least gets a bounce.
  if (!stored && !noticed) {
    message.setReject("Mailbox temporarily unavailable. Please use the contact form on https://www.narli-digital.de");
    return "rejected";
  }
  return stored ? "stored" : "noticed";
}

export function buildNotice({ info, raw, key, from, to, now = new Date(), reason, id = crypto.randomUUID() }) {
  const boundary = `narli-${id}`;
  const attach = raw.byteLength <= MAX_ATTACHMENT_BYTES;
  const sizeKb = Math.max(1, Math.round(raw.byteLength / 1024));
  const text = [
    "Diese E-Mail an info@narli-digital.de konnte nicht in Ihr Postfach weitergeleitet werden.",
    "Das Postfach hat sie abgelehnt, meist weil der Absender keine E-Mail-Authentifizierung",
    "(SPF, DKIM, DMARC) eingerichtet hat. Es kann Spam sein, aber auch eine echte Anfrage.",
    "",
    `Absender: ${info.from || "-"}`,
    `An: ${info.to || "-"}`,
    `Betreff: ${info.subject || "(ohne Betreff)"}`,
    `Datum: ${info.date || "-"}`,
    `Größe: ${sizeKb} KB`,
    `Grund: ${reason || "-"}`,
    "",
    attach
      ? "Die vollständige Originalnachricht hängt als Datei original.eml an."
      : "Die Originalnachricht ist zu groß für einen Anhang.",
    key
      ? `Sie ist außerdem 90 Tage in Cloudflare gespeichert (Workers KV "narli-mail-undelivered", Schlüssel ${key}).`
      : "Achtung: Die Nachricht konnte nicht in Cloudflare gespeichert werden.",
    "",
    "Vorsicht bei Links und Anhängen in der Originalnachricht.",
    isEmail(info.from) ? "Wenn Sie auf diese E-Mail antworten, geht die Antwort an den ursprünglichen Absender." : "",
  ].join("\r\n");

  const headers = [
    `From: ${encodeHeader("NARLI DIGITAL Postfach")} <${from}>`,
    `To: <${to}>`,
    ...(isEmail(info.from) ? [`Reply-To: <${info.from}>`] : []),
    `Subject: ${encodeHeader(`[Nicht zugestellt] ${info.subject || "(ohne Betreff)"}`)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@narli-digital.de>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ];
  const wrap = (b64) => b64.replace(/.{1,76}/g, "$&\r\n");
  const parts = [
    `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(base64(text))}`,
  ];
  if (attach) {
    parts.push(
      `--${boundary}\r\nContent-Type: application/octet-stream; name="original.eml"\r\n` +
        `Content-Disposition: attachment; filename="original.eml"\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(base64Bytes(raw))}`
    );
  }
  return `${headers.join("\r\n")}\r\n\r\n${parts.join("")}--${boundary}--\r\n`;
}
