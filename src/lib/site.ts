/**
 * Single source of truth for all company information.
 *
 * Everything below is transcribed from the client's visiting card, which
 * supersedes the old demo. The old demo was wrong in almost every detail:
 * it invented a Hyderabad address, a fake phone number, a fake email, and it
 * described the business as Mumbai-only when it in fact runs seven branches.
 *
 * Every component reads from this file, so contact details cannot drift
 * out of sync between the header, footer and contact page again.
 */

export const SITE = {
  name: 'Speed Safety Nets',
  tagline: 'Professional Netting Solutions',
  description:
    'Manufacturer and installer of safety nets, cricket nets, football turf, bird nets, shade nets, artificial grass and green walls. Mumbai head office with branches across Maharashtra, Gujarat and Delhi.',

  /** ⚠️ NOT YET REGISTERED — see DOMAIN_NOTE below. */
  url: 'https://speedsafetynet.com',

  proprietor: 'Mr. Subhan',
  gst: '27CVNPS0055B1ZM',
  insurancePolicyNo: '920222227110009074',

  /** Strong trust signals — the old demo used none of these. */
  certifications: [
    { label: 'ISO 9001:2015', detail: 'Certified by Government' },
  ],

  /**
   * Rope brands shown on the visiting card. Garware Technical Fibres is a
   * major Indian manufacturer, so this association is a genuine credibility
   * asset worth showing on the home page.
   * ⚠️ Confirm the exact relationship (authorised dealer / distributor /
   * supplier) before publishing any claim — overstating it is a legal risk.
   */
  brandAssociations: [
    { name: 'Garware Wall Ropes', relationship: 'TO BE CONFIRMED' },
    { name: 'Maruti Ropes', relationship: 'TO BE CONFIRMED' },
  ],

  contact: {
    /*
     * The landline 022-6633 1119 was removed on the client's instruction — the
     * line is not in service. It is deliberately not left here commented out
     * and hidden: a dead number that a customer dials and gets nothing from is
     * worse than no number at all, because they conclude the business is gone
     * rather than that one line changed. The mobiles below are the live
     * contacts. If a working landline is ever connected, add it back here and
     * to the LocalBusiness "telephone" field in src/app/layout.tsx.
     */

    /** Primary mobile — Mr. Subhan. */
    phoneDisplay: '98926 12816',
    phoneE164: '919892612816',

    /** Additional mobiles from the card. */
    altPhones: [
      { display: '98334 26716', e164: '919833426716' },
      { display: '97680 07866', e164: '919768007866' },
    ],

    /** Enquiries from the website route here. */
    whatsappE164: '919892612816',

    email: 'speedsafetynet@gmail.com',
  },

  /** Head office, exactly as printed on the visiting card. */
  address: {
    shop: 'Shop 53 A',
    line1: 'P D Mello Road',
    line2: 'Princess Dock, Beside Prabhu Restaurant Bar',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400009',
    country: 'India',
    countryCode: 'IN',
  },

  /**
   * Seven locations, not one. The old demo described a Mumbai-only business —
   * that materially undersells them, and multi-city presence is a real
   * differentiator when quoting national contractors.
   *
   * Nashik and Vadodara are new branches, added October 2026.
   *
   * Ordered by region — Maharashtra, Gujarat, then Delhi — rather than by
   * when they opened, so the list reads as a network. Head office first.
   *
   * ADD A BRANCH HERE AND NOWHERE ELSE. Every count on the site reads
   * `SITE.branches.length` and every prose list is built by
   * branchesOneLine() at the bottom of this file, so nothing can be left
   * saying "five cities" after the sixth opens. That had already happened:
   * three pages named the old five by hand.
   */
  branches: [
    { city: 'Mumbai', isHeadOffice: true },
    { city: 'Pune', isHeadOffice: false },
    { city: 'Nashik', isHeadOffice: false },
    { city: 'Ahmedabad', isHeadOffice: false },
    { city: 'Vadodara', isHeadOffice: false },
    { city: 'Surat', isHeadOffice: false },
    { city: 'Delhi', isHeadOffice: false },
  ],

  serviceAreas: [
    'Mumbai',
    'Pune',
    'Nashik',
    'Ahmedabad',
    'Vadodara',
    'Surat',
    'Delhi',
    'Pan-India',
  ],

  hours: 'Monday to Saturday, 9:00 AM – 7:00 PM',
} as const;

/**
 * ⚠️ DOMAIN — NEEDS A DECISION BEFORE LAUNCH
 *
 * The visiting card advertises `www.speedsafetynet.com` and the email is
 * `speedsafetynet@gmail.com` — the brand spelling is "speedsafetynet",
 * with NO "y" after "speed".
 *
 * A query to Verisign's RDAP registry (the authoritative source for .com)
 * returns "not found" for speedsafetynet.com — meaning it is currently
 * unregistered, most likely lapsed. Content matching this exact shop address
 * does exist from an older web presence, so a site did run there at some point.
 *
 * Registering `speedysafetynet.com` instead would mean every visiting card
 * already printed points to a different address than the live site.
 */
export const DOMAIN_NOTE = {
  onVisitingCard: 'speedsafetynet.com',
  previouslyDiscussed: 'speedysafetynet.com',
  registryStatus: 'speedsafetynet.com — not found in Verisign RDAP (unregistered)',
  recommendation:
    'Register speedsafetynet.com to match all printed material. Optionally also register speedysafetynet.com and redirect it, to catch the misspelling.',
} as const;

/**
 * ⚠️ ABOUT-PAGE CONFLICT — CONFIRM WITH CLIENT
 *
 * Three different origin stories are in circulation:
 *   - Old demo:      "Est. 2014", proprietor Mr. Subhan Shaikh
 *   - Visiting card: proprietor "Mr. Subhan"
 *   - Older web presence at the same shop address: established 2006,
 *     proprietor "Munawar Borkar"
 *
 * Do not publish a founding year or proprietor name until the client
 * confirms. An older founding date is an asset if it is true — 2006 means
 * nearly twenty years in business.
 */
export const ABOUT_UNCONFIRMED = {
  foundingYear: null as number | null,
  proprietorFullName: null as string | null,
} as const;

/** Main navigation. */
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Government',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Formats the head-office address as a single line. */
export const addressOneLine = (): string =>
  [
    SITE.address.shop,
    SITE.address.line1,
    SITE.address.line2,
    `${SITE.address.city} - ${SITE.address.postalCode}`,
  ].join(', ');

/**
 * The branch cities as a prose list — "Pune, Nashik, Ahmedabad, Vadodara,
 * Surat and Delhi".
 *
 * Exists so page copy and meta descriptions never hard-code the list. They
 * used to, in three places, and a visitor could read "branches in Pune,
 * Ahmedabad, Delhi and Surat" directly above a list showing seven cities.
 *
 * Head office is excluded by default: most sentences read "Mumbai head
 * office with branches in …", and naming Mumbai twice is clumsy.
 */
export const branchesOneLine = (includeHeadOffice = false): string => {
  const cities = SITE.branches
    .filter((b) => includeHeadOffice || !b.isHeadOffice)
    .map((b) => b.city);
  if (cities.length < 2) return cities.join('');
  return `${cities.slice(0, -1).join(', ')} and ${cities[cities.length - 1]}`;
};
