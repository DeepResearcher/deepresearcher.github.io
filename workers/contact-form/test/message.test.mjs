// node --test workers/contact-form/test/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEmail, encodeHeader, looksLikeBot, validate } from "../src/message.js";

const decodeWords = (header) =>
  header.replace(/\r\n /g, "").replace(/=\?UTF-8\?B\?([^?]+)\?=/g, (_m, b64) => Buffer.from(b64, "base64").toString("utf8"));

test("accepts a normal request and trims the fields", () => {
  const { form, errors } = validate({ name: "  Anna Müller ", email: "anna@example.de", message: "  Wir brauchen eine Website.  ", type: "dynamic", lang: "en" });
  assert.deepEqual(errors, []);
  assert.equal(form.name, "Anna Müller");
  assert.equal(form.message, "Wir brauchen eine Website.");
  assert.equal(form.type, "dynamic");
  assert.equal(form.lang, "en");
});

test("rejects missing name, bad e-mail and too short message", () => {
  assert.deepEqual(validate({ name: "", email: "no-at-sign", message: "kurz" }).errors, ["name", "email", "message"]);
  assert.deepEqual(validate(null).errors, ["name", "email", "message"]);
});

test("blocks header injection through the e-mail address or the name", () => {
  assert.ok(validate({ name: "A", email: "a@example.de\r\nBcc: x@example.com", message: "0123456789" }).errors.includes("email"));
  assert.ok(validate({ name: "A", email: "Eve <eve@example.com>", message: "0123456789" }).errors.includes("email"));
  const { form } = validate({ name: "Eve\r\nBcc: x@example.com", email: "eve@example.com", message: "0123456789" });
  assert.equal(form.name, "Eve Bcc: x@example.com");
  const mail = buildEmail({ form, from: "website@narli-digital.de", to: "inbox@example.com", id: "x" });
  const headers = mail.split("\r\n\r\n")[0].split("\r\n").filter((line) => !line.startsWith(" "));
  assert.ok(!headers.some((line) => line.startsWith("Bcc:")));
});

test("unknown website types fall back to 'unsure' and long text is cut", () => {
  const { form } = validate({ name: "x".repeat(500), email: "a@b.de", message: "m".repeat(9000), type: "__proto__" });
  assert.equal(form.type, "unsure");
  assert.equal(form.name.length, 120);
  assert.equal(form.message.length, 4000);
});

test("spots bots by the hidden field or a too fast submission", () => {
  assert.equal(looksLikeBot({ website: "http://spam.example", elapsed: 9000 }), true);
  assert.equal(looksLikeBot({ elapsed: 1200 }), true);
  assert.equal(looksLikeBot({}), true);
  assert.equal(looksLikeBot({ website: "", elapsed: 15000 }), false);
});

test("encodes header words under 76 characters and round-trips umlauts", () => {
  const value = "Website-Anfrage: Jürgen Größe-Übermaß, Bäckerei „Sonnenkorn“ GmbH & Co. KG";
  const encoded = encodeHeader(value);
  for (const word of encoded.split("\r\n ")) assert.ok(word.length <= 75, word);
  assert.equal(decodeWords(encoded), value);
});

test("builds a plain-text e-mail with Reply-To pointing at the visitor", () => {
  const { form } = validate({ name: "Anna Müller", email: "anna@example.de", phone: "+49 30 123", message: "Wir brauchen einen Shop.\nMit Abholung.", type: "dynamic" });
  const mail = buildEmail({ form, from: "website@narli-digital.de", to: "inbox@example.com", date: new Date("2026-11-13T14:05:00Z"), id: "abc" });
  const [head, body] = mail.split("\r\n\r\n");
  assert.match(head, /^From: =\?UTF-8\?B\?.+\?= <website@narli-digital\.de>$/m);
  assert.match(head, /^To: <inbox@example\.com>$/m);
  assert.match(head, /^Reply-To: =\?UTF-8\?B\?.+\?= <anna@example\.de>$/m);
  assert.match(head, /^Message-ID: <abc@narli-digital\.de>$/m);
  assert.equal(decodeWords(head.match(/^Subject: ([\s\S]*?)\r\n(?=\S)/m)[1]), "Website-Anfrage: Anna Müller");
  for (const line of body.trimEnd().split("\r\n")) assert.ok(line.length <= 76);
  const text = Buffer.from(body.replace(/\r\n/g, ""), "base64").toString("utf8");
  assert.match(text, /Name: Anna Müller/);
  assert.match(text, /Telefon: \+49 30 123/);
  assert.match(text, /Art der Website: Shop oder Buchungen/);
  assert.match(text, /Gesendet: 13\.11\.2026, 15:05 Uhr/);
  assert.match(text, /Mit Abholung\./);
});
