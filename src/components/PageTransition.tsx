'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

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

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
