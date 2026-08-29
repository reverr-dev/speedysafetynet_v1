import type { Product, ProductImage } from './types';
import productsData from '../../content/products.json';
import settingsData from '../../content/settings.json';

/**
 * The catalogue — loaded from content/, not defined here.
 *
 * This file used to BE the data: 25 product records written out as a
 * TypeScript array. They now live in content/products.json and this module is
 * the typed door onto them.
 *
 * Why the move: the content panel writes this data, and it must never write
 * TypeScript. A client typing an apostrophe into a product name — "Peter's
 * Building" — would produce a file that does not compile, the build would
 * fail, and the whole site would be unavailable, not just the new product.
 * JSON has no such failure mode. A string is a string.
 *
 * Nothing downstream changed. Every export below keeps the same name and the
 * same signature it had before, so no component needed touching.
 */

/**
 * Validation happens at BUILD time, not at request time.
 *
 * This matters more than it looks for a statically exported site. If the JSON
 * is malformed, the build throws and Cloudflare keeps serving the previous
 * deployment — the client's website stays up and the bad change simply does
 * not land. Validating lazily at render time would instead ship a broken page.
 *
 * The panel validates the same rules server-side before it commits anything,
 * so this should never fire in practice. It is here for the case the panel
 * cannot cover: someone editing the JSON by hand.
 */
function loadProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    throw new Error('content/products.json must contain a list of products.');
  }

  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();

  return raw.map((item, i) => {
    const where = `content/products.json[${i}]`;

    const need = (field: string): string => {
      const value = (item as Record<string, unknown>)[field];
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${where}: "${field}" is required.`);
      }
      return value;
    };

    const slug = need('slug');
    const id = need('id');

    // A URL segment with a space or a capital in it produces a page that is
    // reachable at one address and linked at another.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        `${where}: slug "${slug}" must be lowercase letters, numbers and single hyphens.`,
      );
    }

    // Duplicates are the dangerous case: two products with the same slug
    // generate the same page path and one silently overwrites the other. The
    // client would report it as "my new product did not save".
    if (seenSlugs.has(slug)) throw new Error(`${where}: slug "${slug}" is used twice.`);
    if (seenIds.has(id)) throw new Error(`${where}: id "${id}" is used twice.`);
    seenSlugs.add(slug);
    seenIds.add(id);

    const images = (item as { images?: unknown }).images;
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error(`${where}: at least one image entry is required.`);
    }

    return item as Product;
  });
}

export const PRODUCTS: Product[] = loadProducts(productsData);

// ── Lookups ──────────────────────────────────────────────────────────────

export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const productsInCategory = (categorySlug: string): Product[] =>
  PRODUCTS.filter((p) => p.categorySlug === categorySlug);

export const featuredProducts = (): Product[] => PRODUCTS.filter((p) => p.featured);

export const countByCategory = (categorySlug: string): number =>
  productsInCategory(categorySlug).length;

/**
 * Lightweight client-side search across name, description and applications.
 * Adequate for 25 products; swap for a proper index only if the catalogue
 * grows past a few hundred items.
 */
export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) =>
    [p.name, p.shortDescription, p.fullDescription, ...(p.applications ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
};

// ── Home page hero ───────────────────────────────────────────────────────

/**
 * The four products shown below the hero on the home page.
 *
 * These now live in content/settings.json so the client can change them from
 * the panel — they are his shop window and are expected to change with the
 * season (shade nets before summer, monsoon sheds before the rains).
 *
 * Exactly four. The band has four seats; a fifth wraps onto its own row and
 * three leave a visible gap.
 */
export const HERO_PRODUCT_SLUGS: readonly string[] = settingsData.heroProductSlugs;

/**
 * Hero photographs are NOT the same files as the catalogue photographs.
 *
 * The catalogue uses ordinary rectangular photos. The hero band needs the
 * product cut out against transparency — a .png with a real alpha channel —
 * so it floats on the tinted background instead of sitting in a visible box.
 * A rectangular photo here is what makes a site look like a template.
 *
 * Shoot on any plain background, remove it, export PNG. Roughly square
 * framing with a little breathing room: the four seats assume similar
 * proportions, so one very wide and one very tall product unbalances the row.
 */
export const HERO_IMAGES: Record<string, ProductImage> = settingsData.heroImages;

export interface HeroProduct {
  product: Product;
  image: ProductImage;
  /** 'cutout' floats on the tint; 'photo' fills the card edge to edge. */
  kind: 'cutout' | 'photo';
}

/**
 * The hero four, resolved to real products.
 *
 * Prefers a transparent cutout where one exists, because a product floating on
 * the tint looks composed. Falls back to the product's own catalogue
 * photograph, which is what we actually have — expecting a netting contractor
 * to produce background-removed PNGs before launch was never realistic, and a
 * band showing four grey placeholders is worse than one showing four photos.
 *
 * A slug with no product at all is skipped rather than throwing. If the client
 * removes a product that happens to be featured, the band shows three cards;
 * a missing fourth card is cosmetic, a failed build is an outage.
 */
export const heroProducts = (): HeroProduct[] =>
  HERO_PRODUCT_SLUGS.map((slug) => {
    const product = getProduct(slug);
    if (!product) return null;
    const cutout = HERO_IMAGES[slug];
    return cutout
      ? { product, image: cutout, kind: 'cutout' as const }
      : { product, image: product.images[0], kind: 'photo' as const };
  }).filter((x): x is HeroProduct => x !== null);

/**
 * Shot list to hand to the client. Every product needs at least one real
 * photograph before launch — stock imagery on a safety equipment site
 * undermines exactly the credibility we are trying to build.
 */
export const PHOTO_MANIFEST = PRODUCTS.map((p) => ({
  product: p.name,
  file: p.images[0].src.split('/').pop(),
  suggestedShot: p.images[0].alt,
}));
