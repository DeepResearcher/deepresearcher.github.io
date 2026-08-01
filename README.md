# NARLI DIGITAL

Responsive bilingual landing page for **NARLI DIGITAL: Digital Solutions for European Projects**.

## Current status

- Static HTML/CSS/JavaScript website
- German and English language switch
- Responsive navigation and layouts
- Cloudflare Pages security headers included
- Search indexing intentionally disabled during preview
- Existing `app-ads.txt` preserved

## Cloudflare Pages deployment

Connect this repository to Cloudflare Pages with the following settings:

- **Repository:** `DeepResearcher/deepresearcher.github.io`
- **Production branch:** `main`
- **Framework preset:** `None`
- **Build command:** leave empty
- **Build output directory:** `/`
- **Root directory:** leave empty

Cloudflare will provide a temporary `*.pages.dev` URL. Custom domains can be added after `narli-digital.eu`, `narli-digital.de` and `narli-digital.com` become active.

## Before public launch

1. Add a complete legal notice (`Impressum`) and privacy policy (`Datenschutzerklärung`).
2. Replace `noindex,nofollow` in `index.html` with `index,follow`.
3. Change `robots.txt` to allow crawling.
4. Confirm the final contact email and business details.
5. Add the final custom domain and canonical URL.
