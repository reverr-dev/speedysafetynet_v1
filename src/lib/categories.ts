import type { Category } from './types';

/**
 * The 14 categories, grouped into three buying intents.
 *
 * The old demo listed all 14 as a flat row of filter chips, which is the main
 * navigation weakness: a visitor looking for a balcony net had to read 14
 * labels to find it. Grouping cuts that to three, then a short list.
 */
export const CATEGORIES: Category[] = [
  // ── Safety & Protection ────────────────────────────────────────────────
  {
    slug: 'safety-nets',
    name: 'Safety Nets',
    blurb: 'Fall protection and debris containment for construction sites, balconies and open shafts.',
    group: 'Safety & Protection',
    order: 1,
  },
  {
    slug: 'invisible-grills',
    name: 'Invisible Grills',
    blurb:
      'Stainless steel cable grills for windows and balconies — fall protection that keeps the view and the airflow.',
    group: 'Safety & Protection',
    order: 2,
  },
  {
    slug: 'bird-nets',
    name: 'Bird Nets',
    blurb: 'Humane pigeon and bird exclusion netting for balconies, ducts, atriums and warehouses.',
    group: 'Safety & Protection',
    order: 3,
  },
  {
    slug: 'bird-spikes',
    name: 'Bird Spikes',
    blurb: 'Stainless steel and polycarbonate spikes that stop birds perching on ledges and signage.',
    group: 'Safety & Protection',
    order: 4,
  },
  {
    slug: 'pp-rope',
    name: 'PP Rope',
    blurb: 'Braided and twisted polypropylene rope for net tensioning, cargo securing and height safety.',
    group: 'Safety & Protection',
    order: 5,
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    blurb: 'Hooks, anchors, clamps, turnbuckles and fixings used in professional net installation.',
    group: 'Safety & Protection',
    order: 6,
  },

  // ── Shading & Covers ───────────────────────────────────────────────────
  {
    slug: 'shade-nets',
    name: 'Shade Nets',
    blurb: 'Agricultural, car park and privacy shade netting in a range of shade percentages.',
    group: 'Shading & Covers',
    order: 7,
  },
  {
    slug: 'monsoon-shed',
    name: 'Monsoon Sheds',
    blurb: 'Custom fabricated rain shelters for storage yards, loading bays and open work areas.',
    group: 'Shading & Covers',
    order: 8,
  },
  {
    slug: 'pe-tarpaulin',
    name: 'PE Tarpaulin',
    blurb: 'Waterproof PE and HDPE tarpaulin sheets for covering goods, vehicles and structures.',
    group: 'Shading & Covers',
    order: 9,
  },

  // ── Sports & Landscaping ───────────────────────────────────────────────
  {
    slug: 'sports-nets',
    name: 'Sports Nets',
    blurb: 'Cricket practice enclosures, goal nets and boundary netting for courts and grounds.',
    group: 'Sports & Landscaping',
    order: 10,
  },
  {
    slug: 'football-turf',
    name: 'Football Turf',
    blurb: 'Professional grade sports turf engineered for heavy footfall and player safety.',
    group: 'Sports & Landscaping',
    order: 11,
  },
  {
    slug: 'artificial-grass',
    name: 'Artificial Grass',
    blurb: 'Maintenance-free landscape turf for gardens, terraces and rooftop lawns.',
    group: 'Sports & Landscaping',
    order: 12,
  },
  {
    slug: 'carpet-grass',
    name: 'Carpet Grass',
    blurb: 'Portable grass rolls for events, exhibitions and temporary installations.',
    group: 'Sports & Landscaping',
    order: 13,
  },
  {
    slug: 'grass-mats',
    name: 'Grass Mats',
    blurb: 'Interlocking modular grass tiles for quick balcony and patio makeovers.',
    group: 'Sports & Landscaping',
    order: 14,
  },
  {
    slug: 'nylon-hammock',
    name: 'Nylon Hammocks',
    blurb: 'High-tensile nylon rope mesh for hammocks, adventure zones and play areas.',
    group: 'Sports & Landscaping',
    order: 15,
  },
];

export const CATEGORY_GROUPS = [
  'Safety & Protection',
  'Shading & Covers',
  'Sports & Landscaping',
] as const;

export const getCategory = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const categoriesByGroup = (group: string): Category[] =>
  CATEGORIES.filter((c) => c.group === group).sort((a, b) => a.order - b.order);
