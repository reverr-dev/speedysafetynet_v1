# Product photographs

## The rule

**One file per product. The filename is the product's slug.**

```
public/images/products/balcony-anti-fall-net.jpg
                       └─────────┬─────────┘
                    the product's `slug` in src/lib/products.ts
```

Drop a correctly-named file in this folder and the photo appears on the site.
**No code change. No data edit. No rebuild logic.**

If the file is not here, the site shows a striped placeholder printing the
exact filename it wants — so a half-finished catalogue tells you what to shoot.

## Accepted formats

`.jpg` · `.jpeg` · `.png` · `.webp` · `.avif`

Use `.jpg` for photographs. `.webp` is roughly 30% smaller if your editor
exports it.

## Size

**Resize to about 1600px on the long edge and keep each file under 400 KB.**

This matters more than it sounds. Most visitors arrive on a phone over mobile
data. A 4 MB photo straight off a camera takes seconds to appear, and Google
measures that delay as part of its ranking. `npm run photos` warns about any
file over 400 KB.

## Checking what is missing

```bash
npm run photos            # what is present, what is missing, what is oversized
npm run photos -- --csv   # shot list as CSV, to send to the client
```

## Adding a second photo to a product

Add it to the `images` array in `src/lib/products.ts`:

```ts
images: [
  img('cricket-box-net.jpg',   'Enclosed cricket practice net box'),
  img('cricket-box-net-2.jpg', 'Close-up of the net tensioning at the frame'),
],
```

Only the first image is used on cards; the detail page can show the rest.

## Alt text is not optional

Every image needs a real description of what is in the photograph. Two reasons:

1. It is what a blind visitor's screen reader reads out.
2. It is a genuine local-SEO signal — "balcony safety net fitted to a Mumbai
   apartment railing" is text Google can index, and the business is trying to
   rank for exactly that phrase.

"net" or "product image" is wasted. Describe the actual picture.

---

Project photographs for the Our Work gallery follow the identical rule, in
`public/images/projects/`, named after the project slug in
`src/lib/services.ts`.
