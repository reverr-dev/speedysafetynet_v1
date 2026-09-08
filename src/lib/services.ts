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
 * Entries marked REAL use the client's own photographs and can be published.
 *
 * ⚠️ The REST ARE PLACEHOLDERS. They describe the type of work he does, but the
 * specific projects, locations and photographs must be supplied and approved by
 * him before launch. Do not publish invented project references — a contractor
 * checking them would catch it immediately, and on a safety-equipment site that
 * is the one kind of doubt you cannot afford.
 */
export const PROJECTS: Project[] = [
  /*
   * Every project below is one of the client's own installations, evidenced by
   * a photograph or a video frame he sent us.
   *
   * Four invented entries used to sit here — a green wall, a high-rise netting
   * job, a balcony bird-netting job and a landscape lawn — written to fill the
   * gallery before we had real material. They are gone. A project gallery is a
   * claim about work someone has actually done, and a customer who asks about
   * one of them and gets a blank look does more damage than a shorter gallery
   * ever could.
   *
   * `location` is deliberately blank where he has not told us where the job
   * was. It renders as nothing rather than as a guess.
   */
  {
    slug: 'indoor-cricket-dome',
    title: 'Indoor Cricket Facility — Tensile Roof',
    location: 'Mumbai',
    categorySlug: 'sports-nets',
    summary:
      'Fully enclosed indoor cricket facility: tensile sheet roof on a steel frame, laid turf, lane netting and full overhead lighting.',
    images: [{ src: '/images/projects/indoor-cricket-dome.jpg', alt: 'Indoor cricket facility with green turf, lane netting and a tensile sheet roof', watermark: false }],
  },
  {
    slug: 'multisport-court',
    title: 'Multi-Sport Court & Turf Ground',
    location: 'Mumbai',
    categorySlug: 'sports-nets',
    summary:
      'Acrylic multi-sport court with perimeter netting, alongside a laid turf football ground on the same site.',
    images: [{ src: '/images/projects/multisport-court.jpg', alt: 'Blue acrylic multi-sport court enclosed in netting beside a green turf football ground', watermark: false }],
  },
  {
    slug: 'floodlit-indoor-arena',
    title: 'Floodlit Indoor Turf Arena',
    location: '',
    categorySlug: 'football-turf',
    summary:
      'Enclosed five-a-side arena in play under floodlights: laid turf, marked pitch, full-height perimeter netting and a netted roof.',
    images: [{ src: '/images/projects/floodlit-indoor-arena.jpg', alt: 'Players on a floodlit indoor turf pitch enclosed by green netting' }],
  },
  {
    slug: 'red-white-turf-arena',
    title: 'Rooftop Turf Arena with Run-Off Margin',
    location: '',
    categorySlug: 'football-turf',
    summary:
      'Turf pitch laid with a contrasting red run-off margin, boxed in on all sides by netting on a red and white steel frame.',
    images: [{ src: '/images/projects/red-white-turf-arena.jpg', alt: 'Green turf pitch with a red run-off margin, enclosed by netting on a red and white frame' }],
  },
  {
    slug: 'rooftop-football-ground',
    title: 'Rooftop Football Ground',
    location: '',
    categorySlug: 'football-turf',
    summary:
      'Marked turf football ground on a building terrace, with goal ends and tall perimeter netting on all four sides.',
    images: [{ src: '/images/projects/rooftop-football-ground.jpg', alt: 'Marked turf football ground on a rooftop with goals and tall perimeter netting' }],
  },
  {
    slug: 'villa-lawn-and-court',
    title: 'Villa Lawn & Sports Enclosure',
    location: '',
    categorySlug: 'artificial-grass',
    summary:
      'Artificial lawn laid across a villa garden and pool surround, with a netted sports enclosure on the same property.',
    images: [{ src: '/images/projects/villa-lawn-and-court.jpg', alt: 'Artificial lawn turf laid across a villa garden with hills behind' }],
  },
];
