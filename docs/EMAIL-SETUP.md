# Enquiry email — setup

What happens when someone sends an enquiry:

```
customer fills the form on speedsafetynet.com
   │
   ├─ WhatsApp button  →  opens WhatsApp with the enquiry ready to send
   │                       (works already, no setup)
   │
   └─ Email button     →  POST /api/enquiry
                            │
                            └─ Cloudflare Worker  (holds the API key)
                                 │
                                 └─ Resend, twice, as enquiries@speedsafetynet.com
                                      │
                                      ├─ the enquiry  → speedsafetynet@gmail.com
                                      │                  Reply-To = the customer,
                                      │                  so Reply in Gmail reaches them
                                      │
                                      └─ a copy       → the customer
                                                         Reply-To = the business
```

**Two emails go out, and they are not equally important.**

The one to the business is awaited, and it alone decides what the visitor is
told. If it fails they see "we could not send" and try WhatsApp instead of
waiting for a reply that is never coming.

The copy to the customer is sent after the response has already gone, and its
failure is deliberately silent. By that point the enquiry is with the
business; if the courtesy copy bounces off a typo'd address or a strict
corporate filter, telling the sender their enquiry failed would be a lie —
and would push them to send the whole thing again.

The copy earns its place twice over: the sender stops wondering whether the
form worked (a fair number of them phone a competitor instead of waiting),
and when they follow up next week they have their own dimensions and notes in
front of them in writing. It quotes no price and confirms nothing — an
automatic message that reads like a commitment is a commitment somebody then
has to honour.

The client needs **no new mailbox**. Enquiries land in the Gmail he already
reads, and Reply-To is set to the customer's own address, so replying from
Gmail reaches them directly.

---

## Why the key is not in the website

The site is a static export — every line of its JavaScript is downloaded by
every visitor. An API key placed there is a key published, and a published
Resend key lets anyone on the internet send email as `speedsafetynet.com`.
That is not a data leak, it is a reputation leak, and it ends with the
client's domain on a spam blocklist.

So there is a Worker. Its only job is this one route. Every other request is
handed straight back to the static files.

---

## The order of these steps is not arbitrary

1. Verify the domain in Resend — until it verifies, Resend will only send to
   your own account address, so nothing else can be tested.
2. **Deploy**, so the Worker has a script. Secrets cannot be attached to an
   assets-only Worker, and until this step that is what it is.
3. Set the key.
4. Throttle.
5. Send a real one.

---

## Step 1 — Verify the domain in Resend

1. Resend → **Domains** → **Add Domain** → `speedsafetynet.com`
2. Resend shows a few records. Add each one in Cloudflare → **DNS → Records**:

| Type | Name | Value |
|---|---|---|
| TXT | `resend._domainkey` | the long DKIM key Resend shows |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| MX | `send` | `feedback-smtp.<region>.amazonses.com`, priority 10 |

Copy the exact values from your Resend screen — the region in the MX record
differs by account, and DKIM is unique per domain.

3. Back in Resend, press **Verify**. Usually a minute or two.

**These do not clash with the Worker.** The Worker's custom domain needs an
`A` record on the root; these are `TXT` and `MX` on the `send` subdomain.
Different names, different types.

**Do not delete existing `MX` or `TXT` records on the root** while doing this.
Those are mail routing and SPF — removing one breaks incoming mail, and it is
the sort of thing nobody notices for a day.

## Step 2 — Deploy once, BEFORE touching secrets

This order matters and is easy to get wrong.

Until now the Worker has been **assets-only** — a folder of HTML with no code
behind it. Cloudflare will tell you as much if you go looking for the secrets
screen first:

> Variables cannot be added to a Worker that only has static assets.

That is not a misconfiguration. An assets-only Worker has nothing that could
read a variable, so there is nowhere to put one. `worker/index.ts` is the
script that changes that, and it has to be uploaded before the key has
anywhere to go.

```bash
cd "E:\SAR Program\Speedysafetynet V1"
npm run deploy
```

After this the Settings page shows **Variables and Secrets** as a normal
section, and `ENQUIRY_FROM` / `ENQUIRY_TO` from `wrangler.jsonc` are already
listed there.

The endpoint is live at this point but will answer 503 — the key is next, and
that is the correct behaviour rather than silently swallowing enquiries.

## Step 3 — Give the Worker the key

Resend → **API Keys** → create one with **Sending access** only.

```bash
npx wrangler secret put RESEND_API_KEY
```

Paste the key when it asks. It is stored encrypted by Cloudflare. It never
enters this repository, and `wrangler` cannot print it back — not even you.

Use the CLI rather than the dashboard box: a key pasted into a browser field
ends up in that machine's form history.

Then deploy once more so the running Worker picks it up:

```bash
npx wrangler deploy
```

## Step 4 — Throttle repeat sends (recommended)

Without this the endpoint still checks the honeypot, validates every field
and rejects cross-origin posts — but nothing stops the same person sending
the same enquiry forty times.

```bash
npx wrangler kv namespace create RATE_LIMIT
```

It prints an id. Paste it into `wrangler.jsonc` and uncomment that line:

```jsonc
"kv_namespaces": [{ "binding": "RATE_LIMIT", "id": "the-id-it-printed" }],
```

The throttle is on the **email address**, not the IP. A whole office, or a
whole mobile network, shares one IP — throttling that turns one nuisance into
a blocked neighbourhood.

## Step 5 — Send one real enquiry

```bash
npm test          # 61 checks
npm run deploy
```

Open the live site, add a product, fill the form, press **Send by Email**.
It should arrive in the client's Gmail within seconds.

If it does not:

```bash
npx wrangler tail
```

then submit again and watch. The Worker logs the reason Resend refused.
Common ones: the domain is not verified yet, or `ENQUIRY_FROM` in
`wrangler.jsonc` uses a domain other than the verified one.

---

## Optional — a real address on the domain, free

`enquiries@speedsafetynet.com` can **send** as soon as Resend is verified, but
nothing **receives** there. If a customer emails that address directly it
bounces.

Cloudflare → **Email Routing** forwards it to his Gmail at no cost. He gets a
professional address for the visiting card, and the mail still lands where he
already looks. This is the part a Zoho mailbox would otherwise be for.

---

## What this costs

Resend's free tier is 3,000 emails a month and 100 a day. The Worker's free
tier is 100,000 requests a day. A netting contractor in Mumbai will not come
close to either.

---

## One thing to decide before handover

The Resend account is **yours**, which is fine and is how this is set up. Just
be aware it means the client's email sending lives under your login, so if the
relationship ever ends, that has to move. Nothing to do today — it is a note
for whenever handover comes up.

Note also that both emails count against the same free tier: one enquiry sends
two, so 3,000 a month is really 1,500 enquiries. Still far more than this
business will produce.

---

## Two kinds of enquiry, one endpoint

The form accepts **either** shape, and the email adapts:

- **Products** — one or many, each with a quantity and a note. Subject line
  names the first product and how many others. The message box, if used,
  appears under *Additional details*.
- **Just a message** — no products at all, for the visitor who has not
  browsed and wants to ask whether we do bird netting for a warehouse.
  Subject line reads *General enquiry*, and the message is the headline, not
  a footnote.

The rule is not "there must be products" — it is "there must be something to
act on". The endpoint enforces the same rule the form does, using the same
functions, because two copies would drift.
