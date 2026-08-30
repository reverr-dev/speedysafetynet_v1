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
 * An override for the picture shown in the home-page band — and ONLY there.
 *
 * Empty, and that is the intended state. The tiles show the client's own
 * pictures, whole: the same file the product page leads with, not a crop of
 * it. Substituting a tighter crop into the tile was tried and reverted — it
 * meant the front page showed something he had never sent us.
 *
 * The one thing that belongs here is a transparent .png cutout, if he ever
 * supplies one: the product against a real alpha channel, which the band can
 * float on the tint with a drop shadow instead of sitting in a visible box.
 * A .jpg here would be a crop by another name.
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
 * Uses the override above where one is set, otherwise the product's own first
 * photograph — which is the client's artwork, and the right default.
 *
 * A slug with no product at all is skipped rather than throwing. If the client
 * removes a product that happens to be featured, the band shows three cards;
 * a missing fourth card is cosmetic, a failed build is an outage.
 */
export const heroProducts = (): HeroProduct[] =>
  HERO_PRODUCT_SLUGS.map((slug) => {
    const product = getProduct(slug);
    if (!product) return null;
    const override = HERO_IMAGES[slug];
    const image = override ?? product.images[0];
    // Only a real alpha channel gets the floating treatment. A .jpg cannot
    // have one, so padding and drop-shadowing it would frame a rectangle in a
    // tinted mount — the thing that made these tiles look unfinished.
    const kind = image.src.toLowerCase().endsWith('.png') ? 'cutout' : 'photo';
    return { product, image, kind } as HeroProduct;
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
