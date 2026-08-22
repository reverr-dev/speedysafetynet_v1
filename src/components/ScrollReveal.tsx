'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Reveals content as it scrolls into view.
 *
 * Elements matching REVEAL_SELECTORS start slightly low and transparent, then
 * ease into place when they enter the viewport. Cards within the same grid
 * stagger, which reads far better than a whole row arriving at once.
 *
 * Two deliberate safety decisions:
 *
 * 1. The hiding class (.js-reveal) is added by THIS SCRIPT, never in the HTML.
 *    If JavaScript fails, is blocked, or this component throws, nothing was
 *    ever hidden — the page just renders normally. Hiding content in CSS and
 *    relying on JS to reveal it is how sites end up blank for some visitors,
 *    and how search engines end up indexing nothing.
 *
 * 2. Anything already in view on load is revealed immediately without
 *    animating, so the top of the page is never briefly blank.
 */

const REVEAL_SELECTORS = [
  '.section-head',
  '.stats',
  '.card',
  '.cat-card',
  '.service-card',
  '.contact-card',
  '.step',
  '.project',
  '.panel',
  '.map-frame',
].join(',');

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS),
    ).filter((el) => !el.classList.contains('is-revealed'));

    if (elements.length === 0) return;

    // Stagger siblings that share a parent — a grid row animates in sequence.
    const seenParents = new Map<Element, number>();

    for (const el of elements) {
      const parent = el.parentElement;
      if (parent) {
        const index = seenParents.get(parent) ?? 0;
        if (index > 0) el.dataset.revealIndex = String(Math.min(index, 5));
        seenParents.set(parent, index + 1);
      }

      // Already on screen at load — show it now, no animation, no flash.
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-revealed');
        continue;
      }

      el.classList.add('js-reveal');
    }

    const hidden = elements.filter((el) => el.classList.contains('js-reveal'));
    if (hidden.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          // Reveal once and stop watching — nothing re-hides on scroll up,
          // which would be distracting on a second pass through the page.
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    hidden.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // Re-runs per route: PageTransition remounts the page, so a fresh set of
    // elements needs observing.
  }, [pathname]);

  return null;
}
