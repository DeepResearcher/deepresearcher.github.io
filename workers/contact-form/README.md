# Contact form worker

Cloudflare Worker behind `https://www.narli-digital.de/api/contact` (and the apex domain). The
"Website anfragen" buttons on `/website-erstellen-lassen` and `/en/website-service` open a form
(`contact-form.js`, `contact-form.css`) that posts here.

What it does:

- accepts only `POST` with JSON from `https://www.narli-digital.de` or `https://narli-digital.de`;
- quietly drops bots (hidden `website` field filled in, or sent within 3 seconds);
- allows 5 messages per minute per IP address;
- checks name, e-mail address and message, cuts every field to a maximum length;
- sends a plain-text e-mail through Cloudflare Email Routing (`send_email` binding) from
  `website@narli-digital.de` to the inbox in the `CONTACT_TO` secret, with `Reply-To` set to the
  visitor, so answering the e-mail answers the visitor;
- stores nothing and never logs personal data.

## Deploying

GitHub Actions (`.github/workflows/contact-form-worker.yml`) runs the tests and a dry-run bundle on
pull requests and deploys on `main`. It needs the repository secrets `CLOUDFLARE_API_TOKEN`
("Edit Cloudflare Workers" template), `CLOUDFLARE_ACCOUNT_ID` and `CONTACT_TO`. `CONTACT_TO` must be
a verified destination address in Email Routing, otherwise Cloudflare refuses to send.

## Tests

```sh
node --test test/*.test.mjs
```
