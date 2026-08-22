# Speed Safety Nets — Website

Production website for Speed Safety Nets (Mumbai). Next.js 15, TypeScript,
static export, deployed to Cloudflare Pages.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands:

```bash
npm run test       # enquiry engine + product data checks (no install needed beyond tsx)
npm run typecheck  # tsc --noEmit
npm run build      # static export into /out
```

Node 18.18 or newer.

## Why this stack

| Decision | Reason |
|---|---|
| **Next.js, static export** | Pages are generated at build time, so Google indexes the full catalogue. The business lives on local search ("safety nets Mumbai") — a client-rendered SPA would be invisible for those queries. |
| **No server, no database** | Nothing to patch, nothing exposed to the internet, ₹0/month hosting. The three most common ways an SMB site gets compromised — outdated plugins, an exposed admin login, database injection — do not apply. |
| **Plain CSS with design tokens** | The whole palette lives in `src/styles/tokens.css`. One file rebrands the site. No build-step dependency for styling. |
| **Cloudflare Pages** | Free for commercial use with unlimited bandwidth. Vercel's free Hobby tier forbids commercial use, which would put a client's business site in breach. |

## Layout

```
src/
  lib/
    site.ts         Company details — SINGLE SOURCE OF TRUTH
    products.ts     25 products
    categories.ts   14 categories, grouped into 3 buying intents
    enquiry.ts      WhatsApp + email enquiry engine
    types.ts
  styles/
    tokens.css      ← the palette lives here
  app/              routes
  components/
test/
  enquiry.test.ts   33 checks
```

**All company details come from `src/lib/site.ts`.** Never hardcode a phone
number or address in a component. The previous version of this site had a
Hyderabad address in the footer and a Mumbai address on the contact page
because that rule was not followed.

---

## ⚠️ Open items before launch

### 1. Domain

The visiting card advertises **`speedsafetynet.com`** (no "y" after "speed")
and the email is `speedsafetynet@gmail.com`.

A Verisign RDAP query returns *not found* for `speedsafetynet.com` — it is
unregistered and available. Register this spelling so the site matches all
printed material. Consider also registering `speedysafetynet.com` and
redirecting it to catch the misspelling.

### 2. Founding year and proprietor — conflicting sources

| Source | Says |
|---|---|
| Visiting card | Mr. Subhan |
| Previous demo | Est. 2014, Mr. Subhan Shaikh |
| Older web presence, same shop address | Est. 2006, Munawar Borkar |

Left blank in `ABOUT_UNCONFIRMED` rather than guessed. If 2006 is correct it
is a genuine asset and belongs on the About page.

### 3. Brand associations

The card shows **Garware Wall Ropes** and **Maruti Ropes** logos. Confirm the
exact relationship before publishing any claim — "authorised dealer" and
"we buy their rope" are legally different statements.

### 4. Products on the card that are missing from the catalogue

Green Wall Artificial · Coconut Nets · Mosquito Nets · Bird Pack Nets ·
Multi Sport Turf

Green Wall Artificial is featured prominently on the card and is likely
high-margin. Needs descriptions and photographs from the client.

### 5. Photography

Every product currently points at a local path under
`/public/images/products/` that does not exist yet. Run
`PHOTO_MANIFEST` in `src/lib/products.ts` for the shot list. Stock imagery on
a safety-equipment site undermines the credibility the site exists to build.
