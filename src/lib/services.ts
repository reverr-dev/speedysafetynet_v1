import type { Project } from './types';

export interface Service {
  slug: string;
  title: string;
  summary: string;
  /** What the client actually gets — kept concrete, not marketing filler. */
  includes: string[];
  /** Category slugs this service sells, used to link into the catalogue. */
  relatedCategories: string[];
  icon: IconName;
}

export type IconName = 'shield' | 'bird' | 'sports' | 'shade' | 'grass' | 'wall';

/**
 * The four engineering services, plus the two the visiting card advertises
 * that the old demo missed entirely.
 */
export const SERVICES: Service[] = [
  {
    slug: 'construction-safety',
    title: 'Construction Safety Netting',
    summary:
      'Fall protection and debris containment for high-rise and industrial sites, measured, engineered and installed by our own team.',
    includes: [
      'Site inspection and hazard assessment',
      'Load-appropriate net selection',
      'Certified anchoring and tensioning',
      'Periodic inspection on long projects',
    ],
    relatedCategories: ['safety-nets', 'pp-rope', 'accessories'],
    icon: 'shield',
  },
  {
    slug: 'bird-proofing',
    title: 'Bird Proofing & Pigeon Netting',
    summary:
      'Humane exclusion systems for balconies, ducts, atriums and warehouses — netting, spikes or both, chosen to suit the structure.',
    includes: [
      'Survey of perching and nesting points',
      'Near-invisible netting where the view matters',
      'Stainless or polycarbonate spike systems',
      'Clean-up before installation',
    ],
    relatedCategories: ['bird-nets', 'bird-spikes'],
    icon: 'bird',
  },
  {
    slug: 'sports-infrastructure',
    title: 'Sports Ground Infrastructure',
    summary:
      'Cricket practice enclosures, football turf, goal nets and boundary netting — supplied, structured and installed as a complete facility.',
    includes: [
      'Ground measurement and layout planning',
      'Support structure fabrication',
      'Turf base preparation and laying',
      'Net fitting and tensioning',
    ],
    relatedCategories: ['sports-nets', 'football-turf'],
    icon: 'sports',
  },
  {
    slug: 'shading-covers',
    title: 'Shading, Sheds & Covers',
    summary:
      'Car park shade mesh, agricultural shade netting, monsoon sheds and tarpaulin covers, fabricated to the dimensions of your site.',
    includes: [
      'Site measurement and shade-factor advice',
      'Custom fabrication to size',
      'Structural mounting and tensioning',
      'Monsoon-season readiness checks',
    ],
    relatedCategories: ['shade-nets', 'monsoon-shed', 'pe-tarpaulin'],
    icon: 'shade',
  },
  {
    slug: 'artificial-landscaping',
    title: 'Artificial Grass & Landscaping',
    summary:
      'Maintenance-free lawn and terrace turf, carpet grass for events, and modular grass tiles for balconies.',
    includes: [
      'Surface preparation and levelling',
      'Drainage provision on terraces',
      'Precision cutting and seam joining',
      'Edge finishing and fixing',
    ],
    relatedCategories: ['artificial-grass', 'carpet-grass', 'grass-mats'],
    icon: 'grass',
  },
  {
    slug: 'green-wall',
    title: 'Artificial Green Walls',
    summary:
      'Vertical garden panels for restaurant frontages, reception areas, balconies and compound walls — the look of a living wall with none of the upkeep.',
    includes: [
      'Wall survey and panel layout',
      'UV-stable foliage panel selection',
      'Framing and secure fixing',
      'Trim and finishing around fixtures',
    ],
    relatedCategories: [],
    icon: 'wall',
  },
];

export const getService = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/**
 * The four-step installation workflow. Carried over from the old demo because
 * it is genuinely good positioning — it says "we are engineers", not
 * "we sell netting".
 */
export const WORKFLOW = [
  {
    step: '01',
    title: 'Site Inspection',
    detail: 'We visit the site, take measurements and assess the hazard or requirement in person.',
  },
  {
    step: '02',
    title: 'System Design',
    detail: 'A solution is designed around your structure — material, mesh size, fixing method and load path.',
  },
  {
    step: '03',
    title: 'Installation',
    detail: 'Our own trained team installs, anchors and tensions the system. We do not subcontract this.',
  },
  {
    step: '04',
    title: 'Handover',
    detail: 'Final quality inspection, a walkthrough of the installed system, and after-sales support.',
  },
] as const;

/**
 * Completed outdoor installations — the "Our Work" gallery, shown on the
 * Services page. Each entry carries a category so the visitor can request the
 * same service directly from the photo.
 *
 * ⚠️ PLACEHOLDER RECORDS. These describe the type of work the client does,
 * but the specific projects, locations and photographs must be supplied and
 * approved by the client before launch. Do not publish invented project
 * references — a contractor checking them would catch it immediately.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'high-rise-safety-netting-mumbai',
    title: 'High-Rise Construction Safety Netting',
    location: 'Mumbai',
    categorySlug: 'safety-nets',
    summary:
      'Perimeter fall-protection and debris netting installed across an active high-rise construction site.',
    images: [{ src: '/images/projects/high-rise-safety-netting-mumbai.jpg', alt: 'Green safety netting wrapped around a high-rise construction site' }],
  },
  {
    slug: 'cricket-practice-nets',
    title: 'Cricket Practice Net Enclosure',
    location: 'Mumbai',
    categorySlug: 'sports-nets',
    summary:
      'Fully enclosed practice net with fabricated support structure for a sports facility.',
    images: [{ src: '/images/projects/cricket-practice-nets.jpg', alt: 'Enclosed cricket practice nets with steel support frame' }],
  },
  {
    slug: 'football-turf-ground',
    title: 'Multi-Sport Turf Ground',
    location: 'Mumbai',
    categorySlug: 'football-turf',
    summary: 'Professional sports turf laid over a prepared base for a five-a-side facility.',
    images: [{ src: '/images/projects/football-turf-ground.jpg', alt: 'Football goal post on a professionally laid turf pitch' }],
  },
  {
    slug: 'artificial-green-wall',
    title: 'Artificial Green Wall Installation',
    location: 'Mumbai',
    categorySlug: '',
    summary:
      'Vertical foliage panels fitted along an outdoor seating area to create a living-wall appearance without maintenance.',
    images: [{ src: '/images/projects/artificial-green-wall.jpg', alt: 'Artificial green wall of dense foliage beside outdoor restaurant seating' }],
  },
  {
    slug: 'lawn-artificial-grass',
    title: 'Landscape Lawn Turf',
    location: 'Mumbai',
    categorySlug: 'artificial-grass',
    summary: 'Striped artificial lawn turf laid across a landscaped garden area.',
    images: [{ src: '/images/projects/lawn-artificial-grass.jpg', alt: 'Striped artificial lawn grass in a landscaped garden' }],
  },
  {
    slug: 'balcony-bird-netting',
    title: 'Residential Balcony Bird Netting',
    location: 'Mumbai',
    categorySlug: 'bird-nets',
    summary:
      'Near-invisible bird netting fitted to apartment balconies, preserving the view while stopping pigeons.',
    images: [{ src: '/images/projects/balcony-bird-netting.jpg', alt: 'Transparent bird netting fitted across an apartment balcony' }],
  },
];
