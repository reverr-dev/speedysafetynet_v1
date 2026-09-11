import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * robots.txt — and it follows the same switch as the meta tag.
 *
 * The important thing here is that it CANNOT disagree with the robots meta
 * tag in layout.tsx. A site that says "index me" in one place and "do not" in
 * the other gets the cautious reading, and the person who set it up spends a
 * fortnight wondering why nothing appears in Google. Both read the same
 * environment variable, so they move together or not at all.
 *
 * Leaving indexing off by default is deliberate: forgetting the flag on a
 * preview costs nothing, while the opposite default costs the client their
 * search ranking to a duplicate of their own site.
 */

const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The enquiry page is a form with nothing to rank for, and it carries
      // its own noindex. Keeping crawlers out of it also keeps them away from
      // the endpoint behind it.
      disallow: ['/enquiry/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
