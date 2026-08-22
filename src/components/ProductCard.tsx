'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { getCategory } from '@/lib/categories';
import { useEnquiry } from './EnquiryStore';
import ProductImage from './ProductImage';
import { CheckIcon } from './Icons';

export default function ProductCard({ product }: { product: Product }) {
  const { add, has } = useEnquiry();
  const [justAdded, setJustAdded] = useState(false);
  const category = getCategory(product.categorySlug);
  const inList = has(product.id);

  const handleAdd = () => {
    add(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  const image = product.images[0];

  return (
    <article className="card">
      <Link href={`/products/${product.slug}`} className="card__media">
        {category && <span className="card__tag">{category.name}</span>}
        <ProductImage src={image.src} alt={image.alt} />
      </Link>

      <div className="card__body">
        <h3 className="card__title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="card__text">{product.shortDescription}</p>

        <div className="card__foot">
          <span className="card__price">
            {product.price ? (
              <>
                ₹{product.price.amount} <span>/ {product.price.unit}</span>
              </>
            ) : (
              'Quote on site'
            )}
          </span>

          <button
            className={`btn ${inList ? 'btn--accent' : 'btn--outline'}`}
            style={{ padding: '6px 14px', minHeight: 36, fontSize: 'var(--text-sm)' }}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to your enquiry list`}
          >
            {justAdded ? (
              <>
                <CheckIcon size={14} /> Added
              </>
            ) : inList ? (
              'Add again'
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
