// Validation and e-mail building for the request forms (website service page and homepage).
// No Cloudflare APIs in here, so the same code runs in the Worker and in the Node tests
// (test/message.test.mjs).

export const LIMITS = { name: 120, email: 200, phone: 60, company: 160, message: 4000, page: 200 };

// Two forms: "website" (website service page) and "project" (homepage, general requests).
export const KINDS = {
  website: {
    subject: "Website-Anfrage",
    heading: "Neue Website-Anfrage über narli-digital.de",
    typeLabel: "Art der Website",
    fallbackType: "unsure",
    types: {
      static: "Visitenkarte oder Landingpage",
      dynamic: "Shop oder Buchungen",
      automation: "Mit Automationen",
      unsure: "Weiß ich noch nicht",
    },
  },
  project: {
    subject: "Projektanfrage",
    heading: "Neue Projektanfrage über narli-digital.de",
    typeLabel: "Thema",
    fallbackType: "other",
    types: {
      web: "Website oder Webanwendung",
      eu: "EU-Projekt",
      game: "Serious Game oder App",
      ai: "KI oder Datenanalyse",
      other: "Etwas anderes",
    },
  },
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
  const kind = data.kind === "project" ? "project" : "website";
  const { types, fallbackType } = KINDS[kind];
  const form = {
    kind,
    name: clean(data.name, LIMITS.name, true),
    email: clean(data.email, LIMITS.email, true),
    phone: clean(data.phone, LIMITS.phone, true),
    company: clean(data.company, LIMITS.company, true),
    type: Object.hasOwn(types, data.type) ? data.type : fallbackType,
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

export const isEmail = (value) => typeof value === "string" && EMAIL.test(value);

const encoder = new TextEncoder();

// Base64 in 32 KiB chunks: fast enough for attachments within the Workers CPU limit.
export function base64Bytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export const base64 = (text) => base64Bytes(encoder.encode(text));

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
  const kind = KINDS[form.kind] || KINDS.website;
  const sent = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" }).format(date);
  const body = [
    kind.heading,
    "",
    `Name: ${form.name}`,
    `E-Mail: ${form.email}`,
    `Telefon: ${form.phone || "-"}`,
    `Unternehmen/Organisation: ${form.company || "-"}`,
    `${kind.typeLabel}: ${kind.types[form.type] || "-"}`,
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
    `Subject: ${encodeHeader(`${kind.subject}: ${form.name}`)}`,
    `Date: ${date.toUTCString()}`,
    `Message-ID: <${id}@narli-digital.de>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  const encodedBody = base64(body).replace(/.{1,76}/g, "$&\r\n");
  return `${headers.join("\r\n")}\r\n\r\n${encodedBody}`;
}
