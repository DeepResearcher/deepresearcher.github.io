# Contact form and mail worker

One Cloudflare Worker (`narli-contact-form`) with two jobs.

## 1. Request forms: `POST /api/contact`

Runs on `https://www.narli-digital.de/api/contact` and the apex domain. The request buttons open a
form (`contact-form.js`, `contact-form.css`) that posts here. They are "Website anfragen" on
`/website-erstellen-lassen` and `/en/website-service`, and "Kontakt aufnehmen" and
"Projekt anfragen" on the homepage.

What it does:

- Accepts only `POST` with JSON from `https://www.narli-digital.de` or `https://narli-digital.de`.
- Quietly drops bots: the hidden `website` field is filled in, or the form was sent within 3 seconds.
- Allows 5 messages per minute per IP address.
- Checks name, e-mail address and message, and cuts every field to a maximum length.
- Sends a plain-text e-mail through Cloudflare Email Routing (`send_email` binding):
  - from `website@narli-digital.de` to the inbox in the `CONTACT_TO` secret;
  - with `Reply-To` set to the visitor, so answering the e-mail answers the visitor.
- Two kinds of request, each with its own subject and topics:
  - `website` ("Website-Anfrage"): from the website-service page;
  - `project` ("Projektanfrage"): from the homepage.
- Stores no form data and never logs personal data.

## 2. Incoming mail for `info@narli-digital.de`

To use this, set the info@ rule in Cloudflare → Email → Email Routing → Routing rules to
**Send to a Worker** → `narli-contact-form`.

- Every message is forwarded to `CONTACT_TO`, as a plain forwarding rule would do.
- If the inbox refuses the forward (Gmail rejects forwarded mail from senders without
  SPF/DKIM/DMARC with `550 5.7.1`), the worker does three things:
  1. It keeps the original for 90 days in Workers KV `narli-mail-undelivered`. The key looks like
     `msg:<time>:<hash>`; the metadata holds sender, subject and reason.
  2. It sends a notice "[Nicht zugestellt] <subject>" from `website@narli-digital.de`, with the
     original attached as `original.eml` when it is 2 MB or smaller. Answering the notice answers
     the original sender. There is at most one notice per sender and subject per day.
  3. If neither storing nor the notice works, it rejects the message so the sender gets a bounce.

To read a kept message, open Cloudflare → Storage & databases → Workers KV →
`narli-mail-undelivered` and view the key's value. It is the full original e-mail as text.

## Deploying

GitHub Actions (`.github/workflows/contact-form-worker.yml`) runs on pull requests and on `main`:

- **On pull requests:** runs the tests and a dry-run bundle.
- **On `main`:** creates the KV namespace if it is missing, deploys, and sets `CONTACT_TO`.

It needs three repository secrets:

- `CLOUDFLARE_API_TOKEN`, made from the "Edit Cloudflare Workers" template;
- `CLOUDFLARE_ACCOUNT_ID`;
- `CONTACT_TO`. It must be a verified destination address in Email Routing, otherwise Cloudflare
  refuses to send.

## Tests

```sh
node --test test/*.test.mjs
```
