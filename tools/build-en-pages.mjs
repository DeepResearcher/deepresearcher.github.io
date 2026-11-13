// Builds the English pages under /en/ from the German pages, and keeps the managed SEO block
// (title, description, canonical, hreflang, Open Graph, Twitter card, JSON-LD) in every page.
//
//   node tools/build-en-pages.mjs          write the files
//   node tools/build-en-pages.mjs --check  exit 1 if any file is out of date (used in CI)
//
// German pages stay the source: edit them, then run this script. English texts come from the
// same dictionaries the language switch uses (script.js, v2.js, landing-pages.js), so the
// English HTML already contains English text before any JavaScript runs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.narli-digital.de";
const check = process.argv.includes("--check");

const read = (file) => readFileSync(join(root, file), "utf8");
const evalLiteral = (code) => vm.runInNewContext(`(${code})`, {});

// ---------- dictionaries ----------

function homeDictionaries() {
  const script = read("script.js");
  const start = script.indexOf("const translations=") + "const translations=".length;
  const end = script.indexOf(";const languageButtons");
  const base = evalLiteral(script.slice(start, end));
  const v2Match = read("v2.js").match(/const v2 = (\{[\s\S]*?\r?\n {2}\});/);
  const v2 = evalLiteral(v2Match[1]);
  return { de: { ...base.de, ...v2.de }, en: { ...base.en, ...v2.en, ...staticFallbackEnglish } };
}

// The #portfolio cards in index.html are a no-JavaScript fallback (services-showcase.js
// replaces them), so no runtime dictionary has their keys.
const staticFallbackEnglish = {
  "portfolio.hub.text": "Multilingual platform with a resource library, e-learning, events and a partner area.",
  "portfolio.game.text": "Interactive learning game for skills development, awareness, simulations and measurable learning progress.",
  "portfolio.ai.text": "AI-assisted search across project materials and support for content, reporting and knowledge workflows.",
};

function landingDictionaries(page) {
  const code = read("landing-pages.js");
  const head = code.slice(0, code.indexOf("const body = document.body;"));
  const { commonTranslations, pageTranslations } = vm.runInNewContext(
    `${head}\n({ commonTranslations, pageTranslations })`,
    {}
  );
  return {
    de: { ...commonTranslations.de, ...pageTranslations[page].de },
    en: { ...commonTranslations.en, ...pageTranslations[page].en },
  };
}

// ---------- page configuration ----------

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "NARLI DIGITAL",
  url: `${SITE}/`,
  logo: `${SITE}/assets/narli-digital-logo-full.svg`,
  email: "info@narli-digital.de",
  telephone: "+49 152 57848836",
  vatID: "DE464660016",
  areaServed: "Europe",
  knowsLanguage: ["de", "en", "tr"],
  description: {
    de: "NARLI DIGITAL entwickelt Websites, Apps, Serious Games, KI-Lösungen und digitale Outputs für Unternehmen, Forschung und europäische Projekte.",
    en: "NARLI DIGITAL develops websites, apps, serious games, AI solutions and digital outputs for businesses, research and European projects.",
  },
};

const images = {
  de: { url: `${SITE}/assets/og/narli-digital-de.png`, alt: "NARLI DIGITAL: Digitale Outputs für europäische Projekte" },
  en: { url: `${SITE}/assets/og/narli-digital-en.png`, alt: "NARLI DIGITAL: Digital outputs for European projects" },
};

const bilingualPages = [
  {
    source: "index.html",
    target: "en/index.html",
    url: { de: `${SITE}/`, en: `${SITE}/en/` },
    meta: {
      de: {
        title: "NARLI DIGITAL | Digitale Outputs für europäische Projekte",
        description: "NARLI DIGITAL entwickelt Websites, Apps, Serious Games, KI-Lösungen und digitale Outputs für europäische Projekte.",
      },
      en: {
        title: "NARLI DIGITAL | Digital Outputs for European Projects",
        description: "NARLI DIGITAL develops websites, apps, serious games, AI solutions and digital outputs for European projects.",
      },
    },
    dictionaries: homeDictionaries,
    jsonLd: true,
  },
  {
    source: "eu-project-websites.html",
    target: "en/eu-project-websites.html",
    url: { de: `${SITE}/eu-project-websites`, en: `${SITE}/en/eu-project-websites` },
    dictionaries: () => landingDictionaries("websites"),
  },
  {
    source: "serious-games-digital-outputs.html",
    target: "en/serious-games-digital-outputs.html",
    url: { de: `${SITE}/serious-games-digital-outputs`, en: `${SITE}/en/serious-games-digital-outputs` },
    dictionaries: () => landingDictionaries("games"),
  },
];

// English-only pages: get sharing tags, no language alternates.
const englishOnlyPages = ["portfolio/index.html", "portfolio/posemetric.html"];

// German attribute texts that the language switch does not translate.
const attributeTranslations = {
  "NARLI DIGITAL Startseite": "NARLI DIGITAL home",
  Hauptnavigation: "Main navigation",
  "Sprache wählen": "Choose language",
  Technologien: "Technologies",
  Kernvorteile: "Key benefits",
  "Typische Bestandteile einer EU-Projektwebsite": "Typical parts of an EU project website",
  "Mögliche interaktive Formate": "Possible interactive formats",
  "Illustration digitaler Outputs mit Webplattform, App, Serious Game und KI-Assistent":
    "Illustration of digital outputs with web platform, app, serious game and AI assistant",
  "Galerie mit digitalen Lernspielen, mobilen Anwendungen, Workshops und E-Learning-Oberflächen":
    "Gallery of digital learning games, mobile applications, workshops and e-learning interfaces",
  "Beispiel eines narrativen Serious Games mit Entscheidungsmechanik":
    "Example of a narrative serious game with decision mechanics",
  "Beispiel einer browserbasierten Quiz- und Serious-Game-Oberfläche":
    "Example of a browser-based quiz and serious game interface",
};

// Internal links that have an English counterpart.
const englishLinks = {
  "/": "/en/",
  "/eu-project-websites": "/en/eu-project-websites",
  "/serious-games-digital-outputs": "/en/serious-games-digital-outputs",
};

// ---------- HTML helpers ----------

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const START = "<!-- seo:start: generated by tools/build-en-pages.mjs, edit the configuration there -->";
const END = "<!-- seo:end -->";

function seoBlock({ lang, title, description, canonical, alternates, jsonLd }) {
  const image = images[lang];
  const lines = [
    START,
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${canonical}">`,
  ];
  if (alternates) {
    lines.push(
      `<link rel="alternate" hreflang="de" href="${alternates.de}">`,
      `<link rel="alternate" hreflang="en" href="${alternates.en}">`,
      `<link rel="alternate" hreflang="x-default" href="${alternates.de}">`
    );
  }
  lines.push(
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="NARLI DIGITAL">`,
    `<meta property="og:locale" content="${lang === "de" ? "de_DE" : "en_GB"}">`
  );
  if (alternates) lines.push(`<meta property="og:locale:alternate" content="${lang === "de" ? "en_GB" : "de_DE"}">`);
  lines.push(
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${image.url}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escapeHtml(image.alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${image.url}">`
  );
  if (jsonLd) {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        { ...organization, "@context": undefined, description: organization.description[lang] },
        {
          "@type": "WebSite",
          "@id": `${SITE}/#website`,
          url: `${SITE}/`,
          name: "NARLI DIGITAL",
          inLanguage: ["de", "en"],
          publisher: { "@id": organization["@id"] },
        },
      ],
    };
    lines.push(`<script type="application/ld+json">${JSON.stringify(data)}</script>`);
  }
  lines.push(END);
  return lines.map((line) => `  ${line}`).join("\n");
}

// Puts the managed block into <head>, replacing an earlier block or the plain
// title/description/canonical tags it supersedes.
function withSeoBlock(html, block) {
  if (html.includes(START)) {
    return html.replace(new RegExp(`[ \\t]*${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`), block);
  }
  let out = html
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n/, "")
    .replace(/[ \t]*<meta name="description"[^>]*>\r?\n/, "")
    .replace(/[ \t]*<link rel="canonical"[^>]*>\r?\n/, "");
  const anchor = out.match(/[ \t]*<meta name="robots"[^>]*>\r?\n/);
  if (!anchor) throw new Error("no <meta name=robots> to anchor the SEO block");
  return out.replace(anchor[0], `${anchor[0]}${block}\n`);
}

function withLangScript(html) {
  if (html.includes('src="/lang.js"')) return html;
  const firstScript = html.match(/[ \t]*<script src=/);
  if (!firstScript) throw new Error("no <script> to put lang.js before");
  return html.replace(firstScript[0], `  <script src="/lang.js" defer></script>\n${firstScript[0]}`);
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toEnglish(html, dictionary, page) {
  let out = html.replace(/<html lang="de"/, '<html lang="en"');
  out = out.replace(/<!doctype html>/i, (doctype) => `${doctype}\n<!-- Generated from ${page.source} by tools/build-en-pages.mjs. Do not edit by hand. -->`);

  // English text for every simple data-i18n element (no nested markup).
  out = out.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (match, open, _tag, key, _text, close) => (dictionary[key] ? `${open}${escapeHtml(dictionary[key])}${close}` : match)
  );

  for (const [german, english] of Object.entries(attributeTranslations)) {
    out = out.replaceAll(`="${german}"`, `="${english}"`);
  }

  // Relative asset paths would break one folder deeper; make them root-relative.
  out = out.replace(/\b(href|src)="(?!\/|#|[a-z]+:|data:)([^"]+)"/g, (_m, attr, value) => `${attr}="/${value}"`);

  // Internal links stay in English.
  out = out.replace(/\bhref="(\/[^"#]*)(#[^"]*)?"/g, (match, path, hash = "") =>
    englishLinks[path] ? `href="${englishLinks[path]}${hash}"` : match
  );

  // The English button starts active.
  out = out
    .replace(/class="lang-button is-active" data-lang="de" aria-pressed="true"/g, 'class="lang-button" data-lang="de" aria-pressed="false"')
    .replace(/class="lang-button" data-lang="en" aria-pressed="false"/g, 'class="lang-button is-active" data-lang="en" aria-pressed="true"');
  return out;
}

// ---------- build ----------

const outputs = new Map();

for (const page of bilingualPages) {
  const dictionary = page.dictionaries();
  const meta = page.meta ?? {
    de: { title: dictionary.de["meta.title"], description: dictionary.de["meta.description"] },
    en: { title: dictionary.en["meta.title"], description: dictionary.en["meta.description"] },
  };
  const german = withLangScript(
    withSeoBlock(read(page.source), seoBlock({ lang: "de", ...meta.de, canonical: page.url.de, alternates: page.url, jsonLd: page.jsonLd }))
  );
  outputs.set(page.source, german);

  const englishBlock = seoBlock({ lang: "en", ...meta.en, canonical: page.url.en, alternates: page.url, jsonLd: page.jsonLd });
  const english = toEnglish(german, dictionary.en, page).replace(
    new RegExp(`[ \\t]*${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`),
    englishBlock
  );
  outputs.set(page.target, english);
}

for (const file of englishOnlyPages) {
  const html = read(file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!html.includes(START) && (!title || !description || !canonical)) throw new Error(`${file}: missing title/description/canonical`);
  const current = html.includes(START)
    ? {
        title: html.match(/<meta property="og:title" content="([^"]*)"/)[1].replace(/&amp;/g, "&"),
        description: html.match(/<meta property="og:description" content="([^"]*)"/)[1].replace(/&amp;/g, "&"),
        canonical: html.match(/<link rel="canonical" href="([^"]*)"/)[1],
      }
    : { title, description, canonical };
  outputs.set(file, withSeoBlock(html, seoBlock({ lang: "en", ...current })));
}

let stale = [];
for (const [file, content] of outputs) {
  const path = join(root, file);
  const before = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (before === content) continue;
  stale.push(file);
  if (!check) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}

if (check && stale.length) {
  console.error(`Out of date: ${stale.join(", ")}. Run: node tools/build-en-pages.mjs`);
  process.exit(1);
}
console.log(stale.length ? `${check ? "Out of date" : "Updated"}: ${stale.join(", ")}` : "All pages up to date.");
