'use client';

import { useSearchParams } from 'next/navigation';
import ProductBrowser from './ProductBrowser';

/**
 * Reads ?category=<slug> so the category cards on the home page can deep-link
 * straight into a filtered catalogue.
 *
 * Split into its own component because useSearchParams opts the subtree into
 * client-side rendering, and it must sit inside a Suspense boundary for the
 * static export build to succeed.
 */
export default function CategoryFromUrl() {
  const params = useSearchParams();
  return <ProductBrowser initialCategory={params.get('category') ?? undefined} />;
}
