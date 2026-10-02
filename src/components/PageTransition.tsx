'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fades and lifts page content on every route change.
 *
 * How it works: `key={pathname}` forces React to discard and remount this
 * subtree whenever the URL changes, which replays the CSS entrance animation.
 * No library, no experimental flags, works identically in dev and in the
 * static export.
 *
 * Placement matters — this sits INSIDE <EnquiryProvider> in the layout, so
 * remounting the page does not remount the provider and the enquiry basket
 * survives navigation. Putting it outside the provider would silently empty
 * the basket every time someone clicked a link.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);

  /*
   * Jump to the top instantly on a route change, then hand smooth scrolling
   * back.
   *
   * THIS IS WHAT MADE NAVIGATION FEEL SLUGGISH.
   *
   * `scroll-behavior: smooth` is set on <html> so that in-page anchor links
   * glide instead of jumping. The side effect is that it also governs the
   * scroll-to-top the router performs on every navigation — so clicking a nav
   * link from halfway down a long page started a slow animated scroll upward
   * while the new page was simultaneously fading in. Two unrelated movements,
   * different durations, in opposite directions. It reads as the site
   * struggling to keep up.
   *
   * A page change is not a scroll. It should be instantaneous, with the fade
   * carrying the sense of movement. So smooth is switched off for exactly the
   * moment the jump happens and restored immediately after, which leaves
   * anchor links behaving as before.
   *
   * Skipped on first render: there is no previous page to leave, and forcing
   * a scroll on load would undo a deep link to an anchor.
   */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    // Restored on the next frame — after the browser has applied the jump,
    // before anybody can click an anchor.
    const id = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previous;
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
