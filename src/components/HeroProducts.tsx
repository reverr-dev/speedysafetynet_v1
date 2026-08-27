'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { heroProducts } from '@/lib/products';
import { useEnquiry } from './EnquiryStore';
import ProductImage from './ProductImage';
import { CheckIcon } from './Icons';

/**
 * The home page hero product cluster.
 *
 * Four products sit in a fixed loose cluster and stay visible the whole time.
 * Nothing changes position — instead the EMPHASIS rotates every few seconds:
 * one card lifts, sharpens and reveals its name and button, while the other
 * three sit back smaller, dimmed and slightly blurred.
 *
 * Why not a carousel: on a carousel most visitors only ever see the first
 * slide, so three of the client's four chosen products go unseen. Here every
 * visitor sees all four immediately and the rotation only directs attention.
 * That was the whole point of putting products in the hero.
 *
 * Only `transform`, `opacity` and `filter` animate, so the compositor handles
 * it and this costs nothing in scroll performance — the same rule as the net
 * background behind it.
 */

const CYCLE_MS = 5000;

/** Fixed seats. Cards keep their seat; only styling moves between them. */
const SEATS = [
  { left: '2%', top: '0%', width: '40%' },
  { left: '54%', top: '6%', width: '34%' },
  { left: '6%', top: '58%', width: '34%' },
  { left: '56%', top: '64%', width: '30%' },
] as const;

export default function HeroProducts() {
  const items = heroProducts();
  const { add } = useEnquiry();
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(
      () => setActive((i) => (i + 1) % items.length),
      CYCLE_MS,
    );
  }, [items.length]);

  useEffect(() => {
    // Someone who has asked their OS to reduce motion gets a static cluster —
    // all four products still visible, just no rotation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    start();
    return () => window.clearInterval(timer.current);
  }, [start]);

  if (items.length === 0) return null;

  /** Clicking a card promotes it immediately — never make someone wait. */
  const promote = (i: number) => {
    setActive(i);
    start();
  };

  return (
    <div className="hero-cluster" aria-label="Featured products">
      {items.map(({ product, image }, i) => {
        const isActive = i === active;
        const seat = SEATS[i];
        return (
          <div
            key={product.id}
            className={`hero-card${isActive ? ' is-active' : ''}`}
            style={{ left: seat.left, top: seat.top, width: seat.width }}
            onMouseEnter={() => promote(i)}
          >
            <button
              type="button"
              className="hero-card__hit"
              onClick={() => promote(i)}
              aria-label={`Show ${product.name}`}
            >
              <ProductImage src={image.src} alt={image.alt} priority={i === 0} />
            </button>

            <Link className="hero-card__name" href={`/products/${product.slug}`}>
              {product.name}
            </Link>

            <button
              type="button"
              className="hero-card__btn"
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              onClick={() => {
                add(product);
                setAdded(product.id);
                window.setTimeout(() => setAdded(null), 1600);
              }}
            >
              {added === product.id ? (
                <>
                  <CheckIcon size={14} /> Added
                </>
              ) : (
                'Add to enquiry'
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
