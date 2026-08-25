import type { Metadata, Viewport } from 'next';
import '@/styles/global.css';
import { SITE } from '@/lib/site';
import { EnquiryProvider } from '@/components/EnquiryStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import PageTransition from '@/components/PageTransition';
import ScrollReveal from '@/components/ScrollReveal';
// ⚠️ DEMO ONLY — delete this import and <ThemeSwitcher /> below before launch.
import ThemeSwitcher from '@/components/ThemeSwitcher';

/**
 * Search engine indexing is OFF unless explicitly switched on.
 *
 * A test deployment on a *.pages.dev preview URL is a real, publicly reachable
 * website. Left indexable, Google will crawl it — and then the business has
 * two copies of the same catalogue competing with each other. The preview,
 * being older, can end up outranking the real domain, and cleaning that up
 * afterwards is slow and annoying.
 *
 * Set NEXT_PUBLIC_ALLOW_INDEXING=true ONLY on the production deployment, once
 * the real domain is pointed at it. Defaulting to "off" means forgetting the
 * flag costs nothing; the opposite default costs the client search ranking.
 */
const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

/** Falls back to the configured domain for local builds and previews. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} | Safety Nets, Sports Nets & Turf — Mumbai`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'safety nets Mumbai',
    'bird net Mumbai',
    'balcony safety net',
    'construction safety net',
    'cricket practice nets',
    'football turf',
    'artificial grass Mumbai',
    'shade net',
    'green wall artificial',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SITE.name,
    title: `${SITE.name} — Professional Netting Solutions`,
    description: SITE.description,
  },
  robots: ALLOW_INDEXING
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#143520',
  width: 'device-width',
  initialScale: 1,
};

/**
 * LocalBusiness structured data.
 *
 * This is what puts the phone number, address and opening hours directly into
 * Google's results panel. For a business that lives on local search it is one
 * of the highest-return things on the whole site.
 */
function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    description: SITE.description,
    url: SITE_URL,
    telephone: `+${SITE.contact.landlineE164}`,
    email: SITE.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.shop}, ${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    areaServed: SITE.serviceAreas.map((a) => ({ '@type': 'Place', name: a })),
    openingHours: 'Mo-Sa 09:00-19:00',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      {/*
        suppressHydrationWarning is required on <body> because browser
        extensions inject attributes into it before React hydrates —
        ColorZilla adds cz-shortcut-listen, Grammarly adds
        data-gr-ext-installed, DarkReader adds its own. The server HTML cannot
        contain them, so React reports a mismatch that is not our bug and that
        we cannot fix from here.

        This suppresses mismatches on THIS element's own attributes only. It
        does not extend to children, so genuine hydration bugs deeper in the
        tree are still reported.
      */}
      <body suppressHydrationWarning>
        <StructuredData />
        {/* ⚠️ DEMO ONLY — the colour-scheme preview bar. It sits first in the
            document so it can be sticky above the header rather than floating
            over it. Delete this line and the import at the top before launch. */}
        <ThemeSwitcher />
        {/* PageTransition sits INSIDE EnquiryProvider so that remounting the
            page on navigation does not remount the provider — the enquiry
            basket has to survive clicking a link. */}
        <EnquiryProvider>
          <Header />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <FloatingActions />
          <ScrollReveal />
        </EnquiryProvider>
      </body>
    </html>
  );
}
