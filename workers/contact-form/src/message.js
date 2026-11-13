// Validation and e-mail building for the website request form. No Cloudflare APIs in here, so the
// same code runs in the Worker and in the Node tests (test/message.test.mjs).

export const LIMITS = { name: 120, email: 200, phone: 60, company: 160, message: 4000, page: 200 };

export const TYPES = {
  static: "Visitenkarte oder Landingpage",
  dynamic: "Shop oder Buchungen",
  automation: "Mit Automationen",
  unsure: "Weiß ich noch nicht",
};

// Deliberately strict: no spaces, quotes, angle brackets, commas or line breaks, so the address
// can go into the Reply-To header as is.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;

function clean(value, max, singleLine) {
  if (typeof value !== "string") return "";
  let out = value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (singleLine) out = out.replace(/\s+/g, " ");
  return out.slice(0, max);
}

export function validate(input) {
  const data = input && typeof input === "object" ? input : {};
  const form = {
    name: clean(data.name, LIMITS.name, true),
    email: clean(data.email, LIMITS.email, true),
    phone: clean(data.phone, LIMITS.phone, true),
    company: clean(data.company, LIMITS.company, true),
    type: Object.hasOwn(TYPES, data.type) ? data.type : "unsure",
    message: clean(data.message, LIMITS.message, false),
    lang: data.lang === "en" ? "en" : "de",
    page: clean(data.page, LIMITS.page, true),
  };
  const errors = [];
  if (!form.name) errors.push("name");
  if (!EMAIL.test(form.email)) errors.push("email");
  if (form.message.length < 10) errors.push("message");
  return { form, errors };
}

// Treated as a bot: the hidden "website" field is filled in, or the form was sent within 3 seconds.
export function looksLikeBot(input) {
  return Boolean(input?.website) || !(Number(input?.elapsed) >= 3000);
}

const encoder = new TextEncoder();
function base64(text) {
  let binary = "";
  for (const byte of encoder.encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// RFC 2047 encoded words (at most 45 bytes of text each), so names and subjects with umlauts,
// quotes or commas are always safe in a header.
export function encodeHeader(value) {
  const words = [];
  let chunk = "";
  for (const char of value) {
    if (chunk && encoder.encode(chunk + char).length > 45) {
      words.push(chunk);
      chunk = "";
    }
    chunk += char;
  }
  if (chunk) words.push(chunk);
  return words.map((word) => `=?UTF-8?B?${base64(word)}?=`).join("\r\n ");
}

export function buildEmail({ form, from, to, date = new Date(), id = crypto.randomUUID() }) {
  const sent = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" }).format(date);
  const body = [
    "Neue Website-Anfrage über narli-digital.de",
    "",
    `Name: ${form.name}`,
    `E-Mail: ${form.email}`,
    `Telefon: ${form.phone || "-"}`,
    `Unternehmen: ${form.company || "-"}`,
    `Art der Website: ${TYPES[form.type]}`,
    `Seite: ${form.lang === "en" ? "Englisch" : "Deutsch"}${form.page ? ` (${form.page})` : ""}`,
    `Gesendet: ${sent} Uhr`,
    "",
    "Nachricht:",
    form.message,
    "",
    "--",
    `Antworten Sie einfach auf diese E-Mail. Die Antwort geht direkt an ${form.email}.`,
  ].join("\r\n");

  const headers = [
    `From: ${encodeHeader("NARLI DIGITAL Website")} <${from}>`,
    `To: <${to}>`,
    `Reply-To: ${encodeHeader(form.name)} <${form.email}>`,
    `Subject: ${encodeHeader(`Website-Anfrage: ${form.name}`)}`,
    `Date: ${date.toUTCString()}`,
    `Message-ID: <${id}@narli-digital.de>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  const encodedBody = base64(body).replace(/.{1,76}/g, "$&\r\n");
  return `${headers.join("\r\n")}\r\n\r\n${encodedBody}`;
}
