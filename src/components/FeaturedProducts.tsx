'use client';

import Link from 'next/link';
import { useState } from 'react';
import { heroProducts } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { useEnquiry } from './EnquiryStore';
import ProductImage from './ProductImage';
import { ArrowRightIcon, CheckIcon } from './Icons';

/**
 * The client's four chosen products, as a band directly below the hero.
 *
 * This replaces the rotating cluster that briefly sat inside the hero. The
 * rotation was dropped for a reason worth keeping in mind: it meant three of
 * the four products were dimmed at any moment, and it competed with the
 * animated net behind the headline. Two things moving in the same view is one
 * too many — the headline stopped being the thing you looked at first.
 *
 * As a static band each product is equally prominent, always readable, and
 * directly actionable. It also lands exactly where a visitor's eye goes after
 * the headline, which is the strongest position on the page for a product.
 *
 * Which four: HERO_PRODUCT_SLUGS in src/lib/products.ts.
 */
export default function FeaturedProducts() {
  const items = heroProducts();
  const { add } = useEnquiry();
  const [added, setAdded] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="section featured">
      <div className="container">
        <div className="section-head featured__head">
          <span className="eyebrow">Our range</span>
          <h2>What we are best known for</h2>
        </div>

        <div className="featured__grid">
          {items.map(({ product, image, kind }, i) => {
            const category = getCategory(product.categorySlug);
            return (
              <article className="feature-card" key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className={`feature-card__media feature-card__media--${kind}`}
                >
                  {/* The first card is the largest image above the fold, so it
                      must not lazy-load — it is the LCP Google measures. */}
                  <ProductImage src={image.src} alt={image.alt} priority={i === 0} />
                </Link>

                <div className="feature-card__body">
                  {category && (
                    <span className="feature-card__cat">{category.name}</span>
                  )}
                  <h3 className="feature-card__title">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="feature-card__text">{product.shortDescription}</p>

                  <div className="feature-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => {
                        add(product);
                        setAdded(product.id);
                        window.setTimeout(() => setAdded(null), 1600);
                      }}
                    >
                      {added === product.id ? (
                        <>
                          <CheckIcon size={15} /> Added
                        </>
                      ) : (
                        'Add to enquiry'
                      )}
                    </button>
                    <Link className="feature-card__more" href={`/products/${product.slug}`}>
                      Details <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="featured__foot">
          <Link className="btn btn--outline" href="/products">
            See all products <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
