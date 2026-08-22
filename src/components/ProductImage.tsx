'use client';

import { useState } from 'react';

/**
 * A product or project photograph, with a visible fallback when the file is
 * not there yet.
 *
 * THIS IS THE WHOLE IMAGE PIPELINE, and it is deliberately dumb:
 *
 *   The <img> always renders. If the file is missing the browser fires
 *   onError, and we swap in a striped placeholder showing the exact filename
 *   that is expected.
 *
 * Why this rather than checking the filesystem at build time: it means
 * dropping a correctly-named .jpg into public/images/products/ makes the photo
 * appear, with no code change, no rebuild logic and no data edit. The client
 * (or you) can add photography by copying files into a folder. Nobody has to
 * touch TypeScript to publish a picture.
 *
 * And because the fallback names the missing file, an incomplete page is
 * self-documenting — it tells you what to go and shoot.
 */

interface Props {
  src: string;
  alt: string;
  /** Rendered inside the placeholder so the gap explains itself. */
  className?: string;
  /** The first image on a page should not lazy-load — it is the LCP element. */
  priority?: boolean;
}

export default function ProductImage({ src, alt, className, priority = false }: Props) {
  const [failed, setFailed] = useState(false);
  const filename = src.split('/').pop() ?? src;

  if (failed) {
    return (
      <div className={`card__placeholder ${className ?? ''}`} role="img" aria-label={alt}>
        <span>
          Photograph required
          <br />
          {filename}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- next/image adds no
    // benefit here: `images.unoptimized` is required by the static export, and
    // a plain <img> is what gives us the onError fallback above.
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // fetchPriority is respected by Chrome; harmless elsewhere.
      fetchPriority={priority ? 'high' : undefined}
      onError={() => setFailed(true)}
    />
  );
}
