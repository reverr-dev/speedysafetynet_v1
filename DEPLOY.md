# Deploying

## Before you connect anything: build it locally

```bash
npm run typecheck
npm run test
npm run build
```

**`npm run build` must succeed on your machine before you wire up a host.**
A failed build in a hosting dashboard gives you a truncated log and a slow
feedback loop; the same failure locally gives you the real error in seconds.

A successful build writes a folder called `out/` — plain HTML, CSS and JS with
no server. That folder is the entire website.

---

## Cloudflare Pages (recommended)

This is the platform in the client quotation, so testing here means no
surprises at launch.

1. **dash.cloudflare.com** → Workers & Pages → Create → Pages → Connect to Git
2. Pick the repository, keep the default branch
3. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | **None** (not "Next.js" — see note below) |
   | Build command | `npm run build` |
   | Build output directory | `out` |

4. Environment variables → add:

   | Name | Value |
   |---|---|
   | `NODE_VERSION` | `20` |

5. Save and Deploy. You get `https://<project>.pages.dev` in about a minute.

**Why preset "None" and not "Next.js":** the Next.js preset assumes a server
deployment and will try to run the site on Cloudflare's edge runtime. This
project is a static export — `out/` is already finished HTML. Choosing "None"
tells Cloudflare to just serve the folder, which is what we want and what makes
the hosting free.

Every push to the branch redeploys automatically. Pull requests get their own
preview URL.

---

## Alternatives

**Netlify** — same idea. Build `npm run build`, publish directory `out`.
Free tier permits commercial use.

**Vercel** — technically the smoothest for Next.js, but **the free Hobby plan
forbids commercial use.** A client's business site on Hobby breaches their
terms. Fine for your own throwaway testing, not for the client demo.

**GitHub Pages** — free, but serves from `https://user.github.io/repo-name/`,
so it needs `basePath: '/repo-name'` in `next.config.ts` — configuration we
would then have to remove when moving to the real domain. Not worth it.

---

## Environment variables

| Name | When | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ALLOW_INDEXING` | **Production only** | Set to `true` to let Google index the site. Anything else — including not setting it — emits `noindex` on every page. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical URL for meta and Open Graph tags. Defaults to `SITE.url` in `src/lib/site.ts`. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Before launch | Access key from web3forms.com, created against the client's email. Without it the **Send by Email** button reports an honest failure and tells the visitor to use WhatsApp. WhatsApp works with no configuration. |

### ⚠️ Leave indexing off on the test deployment

Do **not** set `NEXT_PUBLIC_ALLOW_INDEXING` on the `*.pages.dev` test site.

A preview URL is a real public website. If Google indexes it, the business ends
up with two copies of the same catalogue competing in search results — and the
preview, having been live longer, can outrank the actual domain once it
launches. Undoing that takes weeks.

Turn indexing on once, on the production deployment, after the real domain is
pointed at it.

---

## Going live on the real domain

1. Register the domain (see the note in `README.md` — the visiting card says
   `speedsafetynet.com`, without the "y")
2. Cloudflare Pages → your project → Custom domains → add it
3. Point the nameservers at Cloudflare. HTTPS is issued automatically
4. Update `url` in `src/lib/site.ts` to the real domain
5. **Now** set `NEXT_PUBLIC_ALLOW_INDEXING=true` and redeploy
6. Submit the site in Google Search Console

---

## Checklist before showing the client

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] `npm run photos` — decide whether placeholders are acceptable for this demo
- [ ] Every page opens: `/`, `/products`, a product page, `/services`, `/about`, `/contact`, `/enquiry`
- [ ] Add a product to the enquiry list, then **Send on WhatsApp** — check the message arrives correctly formatted
- [ ] Open it on an actual phone, not just a narrow browser window
- [ ] Confirm indexing is still **off** (view source, look for `noindex`)
