'use client';

import { useState } from 'react';
import type { ProductImage as ProductImageType } from '@/lib/types';
import ProductImage from './ProductImage';

/**
 * Product image gallery — main image with a thumbnail strip.
 *
 * The thumbnail strip only renders when there is more than one photograph, so
 * a product with a single image looks exactly as it did before rather than
 * showing a lonely thumbnail under it.
 *
 * Filenames follow the same convention as everything else:
 *   first image   →  <slug>.jpg
 *   second image  →  <slug>-2.jpg
 *   third image   →  <slug>-3.jpg
 *
 * So adding a second photograph to a product is: name the file, drop it in
 * public/images/products/, and add one line to the product's `images` array.
 */
export default function ProductGallery({ images }: { images: ProductImageType[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="gallery">
      <div className="gallery__main">
        <ProductImage src={current.src} alt={current.alt} priority />
      </div>

      {images.length > 1 && (
        <div className="gallery__thumbs" role="group" aria-label="Product photographs">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              className="gallery__thumb"
              aria-pressed={i === active}
              aria-label={`Show photograph ${i + 1} of ${images.length}`}
              onClick={() => setActive(i)}
            >
              <ProductImage src={image.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
