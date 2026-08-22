import type { NextConfig } from 'next';

/**
 * Configured for a fully static export.
 *
 * `output: 'export'` produces plain HTML/CSS/JS in /out, which is what lets
 * this site run on Cloudflare Pages for free with no server to maintain and
 * no database exposed to the internet — the security position described in
 * the client quotation.
 *
 * Note: static export means no Next.js API routes. The enquiry email is
 * delivered by an external form endpoint instead, which is deliberate — it
 * keeps the hosting free and removes the server we would otherwise have to
 * patch and pay for.
 */
const nextConfig: NextConfig = {
  output: 'export',

  // Static export cannot run the on-demand image optimiser.
  // Product photos are pre-sized at build time instead.
  images: {
    unoptimized: true,
  },

  // Emit /products/index.html rather than /products.html — required for
  // clean URLs on static hosts.
  trailingSlash: true,

  reactStrictMode: true,

  // Fail the build on type or lint errors rather than shipping them.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
