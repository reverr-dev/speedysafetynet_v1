/**
 * Single source of truth for all company information.
 *
 * Everything below is transcribed from the client's visiting card, which
 * supersedes the old demo. The old demo was wrong in almost every detail:
 * it invented a Hyderabad address, a fake phone number, a fake email, and it
 * described the business as Mumbai-only when it in fact runs five branches.
 *
 * Every component reads from this file, so contact details cannot drift
 * out of sync between the header, footer and contact page again.
 */

export const SITE = {
  name: 'Speed Safety Nets',
  tagline: 'Professional Netting Solutions',
  description:
    'Manufacturer and installer of safety nets, cricket nets, football turf, bird nets, shade nets, artificial grass and green walls. Mumbai head office with branches in Pune, Ahmedabad, Delhi and Surat.',

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
    /** Landline — signals an established business, worth showing prominently. */
    landlineDisplay: '022-6633 1119',
    landlineE164: '912266331119',

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
   * Five locations, not one. The old demo described a Mumbai-only business —
   * this materially undersells them, and multi-city presence is a real
   * differentiator when quoting national contractors.
   */
  branches: [
    { city: 'Mumbai', isHeadOffice: true },
    { city: 'Pune', isHeadOffice: false },
    { city: 'Ahmedabad', isHeadOffice: false },
    { city: 'Delhi', isHeadOffice: false },
    { city: 'Surat', isHeadOffice: false },
  ],

  serviceAreas: ['Mumbai', 'Pune', 'Ahmedabad', 'Delhi', 'Surat', 'Pan-India'],

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
