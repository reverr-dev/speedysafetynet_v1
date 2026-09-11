import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';
import { CATEGORIES } from '@/lib/categories';
import { SITE } from '@/lib/site';

/**
 * sitemap.xml — the list of pages worth indexing, handed to Google directly.
 *
 * Google finds pages by following links, which works but is slow and
 * incomplete for a new domain nobody links to yet. A sitemap submitted in
 * Search Console skips the waiting: it says "here are 30 pages, here is when
 * each last changed", and crawling usually starts within days rather than
 * weeks.
 *
 * Generated from the catalogue rather than typed out. A hand-written sitemap
 * goes stale the first time a product is added, and a sitemap listing a page
 * that 404s is worse than no sitemap — it is a signal the site is unmaintained.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp for the whole build. Claiming per-page dates we do not
  // actually track would be inventing data, and Google discounts lastModified
  // it decides is untrustworthy.
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = [
    // priority is relative, within this site only — it says nothing to Google
    // about how this site compares to any other.
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/products/`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/services/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about/`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact/`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Category listings are query strings on /products, not separate pages, so
  // they are deliberately absent: ?category=bird-nets and the unfiltered list
  // are the same document to a crawler, and submitting both invites Google to
  // treat the catalogue as duplicate content.
  void CATEGORIES;

  for (const product of PRODUCTS) {
    pages.push({
      url: `${SITE_URL}/products/${product.slug}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // /enquiry is not here on purpose. It is a form, it carries noindex of its
  // own, and a sitemap entry contradicting a page's own robots tag is a
  // conflict Google reports as an error in Search Console.
  return pages;
}
