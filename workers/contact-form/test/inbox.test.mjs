// node --test workers/contact-form/test/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNotice, handleIncoming, KEEP_SECONDS, MAX_ATTACHMENT_BYTES } from "../src/inbox.js";

const RAW = [
  "From: Anna Mueller <anna.mueller@putz.example>",
  "To: info@narli-digital.de",
  "Subject: Anfrage",
  "Date: Mon, 10 Nov 2026 09:00:00 +0100",
  "",
  "Hallo, wir brauchen eine neue Website.",
].join("\r\n");

class FakeEmailMessage {
  constructor(from, to, raw) { Object.assign(this, { from, to, raw }); }
}

function fakeKv() {
  const data = new Map();
  return {
    data,
    async put(key, value, options) { data.set(key, { value, options }); },
    async get(key) { return data.get(key)?.value ?? null; },
  };
}

function fakeMessage({ forwardError = null, raw = RAW } = {}) {
  const bytes = new TextEncoder().encode(raw);
  return {
    from: "anna.mueller@putz.example",
    to: "info@narli-digital.de",
    headers: new Headers({ subject: "Anfrage", date: "Mon, 10 Nov 2026 09:00:00 +0100" }),
    raw: new Response(bytes).body,
    forwarded: [],
    rejected: null,
    async forward(to) { this.forwarded.push(to); if (forwardError) throw new Error(forwardError); },
    setReject(reason) { this.rejected = reason; },
  };
}

function fakeEnv({ kv = fakeKv(), sendError = null } = {}) {
  const sent = [];
  return {
    sent,
    env: {
      CONTACT_TO: "inbox@example.com",
      CONTACT_FROM: "website@narli-digital.de",
      UNDELIVERED: kv,
      MAIL: { async send(msg) { if (sendError) throw new Error(sendError); sent.push(msg); } },
    },
  };
}

const GMAIL_REFUSED = "could not forward: 550 5.7.1 This message does not have authentication information";
const decode = (mime) => {
  const parts = mime.split(/--narli-[^\r\n]+/);
  const text = parts[1].split("\r\n\r\n")[1].replace(/\r\n/g, "");
  return Buffer.from(text, "base64").toString("utf8");
};

test("normal mail is only forwarded, nothing is stored or sent", async () => {
  const message = fakeMessage();
  const { env, sent } = fakeEnv();
  assert.equal(await handleIncoming(message, env, { EmailMessage: FakeEmailMessage }), "forwarded");
  assert.deepEqual(message.forwarded, ["inbox@example.com"]);
  assert.equal(env.UNDELIVERED.data.size, 0);
  assert.equal(sent.length, 0);
  assert.equal(message.rejected, null);
});

test("refused mail is kept for 90 days and a notice with the original goes to the inbox", async () => {
  const message = fakeMessage({ forwardError: GMAIL_REFUSED });
  const { env, sent } = fakeEnv();
  const now = new Date("2026-11-13T17:00:00Z");
  assert.equal(await handleIncoming(message, env, { EmailMessage: FakeEmailMessage, now }), "stored");

  const [[key, entry]] = [...env.UNDELIVERED.data].filter(([k]) => k.startsWith("msg:"));
  assert.match(key, /^msg:2026-11-13T17:00:00\.000Z:[0-9a-f]{16}$/);
  assert.equal(new TextDecoder().decode(entry.value), RAW);
  assert.equal(entry.options.expirationTtl, KEEP_SECONDS);
  assert.equal(entry.options.metadata.from, "anna.mueller@putz.example");
  assert.equal(entry.options.metadata.subject, "Anfrage");
  assert.match(entry.options.metadata.reason, /550 5\.7\.1/);
  assert.ok(JSON.stringify(entry.options.metadata).length < 1024, "KV metadata must stay under 1 KB");

  assert.equal(sent.length, 1);
  assert.equal(sent[0].from, "website@narli-digital.de");
  assert.equal(sent[0].to, "inbox@example.com");
  assert.match(sent[0].raw, /^Reply-To: <anna\.mueller@putz\.example>$/m);
  assert.match(sent[0].raw, /filename="original\.eml"/);
  const text = decode(sent[0].raw);
  assert.match(text, /Absender: anna\.mueller@putz\.example/);
  assert.match(text, /Grund: could not forward: 550 5\.7\.1/);
  assert.match(text, new RegExp(`Schlüssel ${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.equal(message.rejected, null);
});

test("a sender retrying all day gets stored every time but noticed only once", async () => {
  const kv = fakeKv();
  const { env, sent } = fakeEnv({ kv });
  for (const minute of [0, 30, 59]) {
    const now = new Date(`2026-11-13T10:${String(minute).padStart(2, "0")}:00Z`);
    await handleIncoming(fakeMessage({ forwardError: GMAIL_REFUSED }), env, { EmailMessage: FakeEmailMessage, now });
  }
  assert.equal([...kv.data.keys()].filter((k) => k.startsWith("msg:")).length, 3);
  assert.equal(sent.length, 1);
});

test("if storage fails the notice still goes out; if both fail the sender gets a bounce", async () => {
  const brokenKv = { async put() { throw new Error("kv down"); }, async get() { throw new Error("kv down"); } };
  const first = fakeEnv({ kv: brokenKv });
  const m1 = fakeMessage({ forwardError: GMAIL_REFUSED });
  assert.equal(await handleIncoming(m1, first.env, { EmailMessage: FakeEmailMessage }), "noticed");
  assert.match(decode(first.sent[0].raw), /konnte nicht in Cloudflare gespeichert werden/);
  assert.equal(m1.rejected, null);

  const second = fakeEnv({ kv: brokenKv, sendError: "send failed" });
  const m2 = fakeMessage({ forwardError: GMAIL_REFUSED });
  assert.equal(await handleIncoming(m2, second.env, { EmailMessage: FakeEmailMessage }), "rejected");
  assert.match(m2.rejected, /contact form/);
});

test("big originals are stored but not attached; odd senders get no Reply-To", () => {
  const raw = new Uint8Array(MAX_ATTACHMENT_BYTES + 1);
  const mime = buildNotice({ info: { from: "<>", subject: "x\r\nBcc: evil@example.com" }, raw, key: "msg:k", from: "website@narli-digital.de", to: "inbox@example.com", reason: "550" });
  assert.doesNotMatch(mime, /original\.eml/);
  assert.doesNotMatch(mime, /^Reply-To:/m);
  assert.doesNotMatch(mime, /^Bcc:/m);
  assert.match(decode(mime), /zu groß für einen Anhang/);
});
