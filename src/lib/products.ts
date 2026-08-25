import type { Product, ProductImage } from './types';

/**
 * All 25 products, ported from the previous demo.
 *
 * Changes made during the port:
 *  - Added a URL `slug` to every product (permanent public URL).
 *  - Replaced random picsum.photos images with local paths under
 *    /public/images/products/. Real photography is required before launch —
 *    see PHOTO_MANIFEST at the bottom of this file for the shot list.
 *  - Added `applications` — these drive long-tail local search traffic
 *    ("balcony safety net for kids Mumbai") which is where an SMB actually wins.
 *  - Added `specs` where the material is unambiguous. Deliberately left EMPTY
 *    where the client must confirm — inventing specifications for safety
 *    equipment would be dishonest and potentially dangerous.
 *
 * This array is the interim data source. When the admin panel is added, these
 * records move to /content/products/*.md and this file becomes the loader.
 * The Product shape does not change, so nothing downstream needs rewriting.
 */

const img = (file: string, alt: string) => ({
  src: `/images/products/${file}`,
  alt,
});

export const PRODUCTS: Product[] = [
  // ── Safety Nets ────────────────────────────────────────────────────────
  {
    id: 'sn-001',
    slug: 'construction-fall-safety-net',
    name: 'Construction Fall Safety Net',
    categorySlug: 'safety-nets',
    shortDescription: 'Site safety nets for high-rise projects.',
    fullDescription:
      'Impact tested debris and fall protection netting for engineering and high-rise construction sites. Installed with correct tensioning and anchoring by our site team.',
    images: [img('construction-fall-safety-net.jpg', 'Construction fall safety net installed on a high-rise site')],
    applications: ['High-rise construction', 'Scaffolding perimeters', 'Open floor edges', 'Lift shafts'],
    featured: true,
  },
  {
    id: 'sn-002',
    slug: 'balcony-anti-fall-net',
    name: 'Balcony Anti-Fall Net',
    categorySlug: 'safety-nets',
    shortDescription: 'Home safety nets for children and pets.',
    fullDescription:
      'Durable nylon netting for balcony safety that protects children and pets without blocking airflow or the view. Fitted to the balcony frame with a discreet fixing system.',
    images: [img('balcony-anti-fall-net.jpg', 'Balcony safety net fitted to a residential balcony railing')],
    applications: ['Apartment balconies', 'Child safety', 'Pet safety', 'Window grilles'],
    featured: true,
  },
  {
    id: 'sn-003',
    slug: 'industrial-debris-net',
    name: 'Industrial Debris Net',
    categorySlug: 'safety-nets',
    shortDescription: 'Fine mesh netting for debris containment.',
    fullDescription:
      'Fine breathable mesh that prevents falling debris from leaving a construction site, protecting pedestrians and vehicles below.',
    images: [img('industrial-debris-net.jpg', 'Fine mesh debris containment net on a building facade')],
    applications: ['Facade renovation', 'Demolition sites', 'Roadside construction'],
  },

  // ── Bird Nets ──────────────────────────────────────────────────────────
  {
    id: 'bn-001',
    slug: 'anti-bird-net',
    name: 'Anti Bird Net',
    categorySlug: 'bird-nets',
    shortDescription: 'Knotted nylon anti-bird netting.',
    fullDescription:
      'Knotted nylon netting that blocks pigeons and other birds without harming them. UV stabilised for long outdoor life.',
    images: [img('anti-bird-net.jpg', 'Anti bird net fitted across a balcony opening')],
    applications: ['Balconies', 'Ducts and shafts', 'Terraces', 'Parking areas'],
    featured: true,
  },
  {
    id: 'bn-002',
    slug: 'birds-protective-nets',
    name: 'Birds Protective Nets',
    categorySlug: 'bird-nets',
    shortDescription: 'Heavy duty protective netting for industrial spaces.',
    fullDescription:
      'Large-span protective netting for warehouses and factories, preventing bird entry and nesting in roof structures.',
    images: [img('birds-protective-nets.jpg', 'Large span bird netting across a warehouse roof structure')],
    applications: ['Warehouses', 'Factory sheds', 'Godowns', 'Atriums'],
  },
  {
    id: 'bn-003',
    slug: 'transparent-bird-net',
    name: 'Transparent Bird Net',
    categorySlug: 'bird-nets',
    shortDescription: 'Near-invisible bird netting that preserves the view.',
    fullDescription:
      'Virtually invisible netting that provides full bird protection while maintaining your outward view. Preferred for sea-facing and high-floor apartments.',
    images: [img('transparent-bird-net.jpg', 'Transparent bird net that is barely visible against a city view')],
    applications: ['Sea-facing apartments', 'High-floor balconies', 'Premium residences'],
  },

  // ── Bird Spikes ────────────────────────────────────────────────────────
  {
    id: 'bs-001',
    slug: 'stainless-steel-bird-spike',
    name: 'Stainless Steel Bird Spike',
    categorySlug: 'bird-spikes',
    shortDescription: 'Industrial grade stainless spikes for ledge protection.',
    fullDescription:
      'Polycarbonate base with stainless steel spikes. Weather resistant and long lasting. Stops birds landing on ledges, parapets and signboards.',
    images: [img('stainless-steel-bird-spike.jpg', 'Stainless steel bird spikes mounted along a building ledge')],
    price: { amount: 65, unit: 'running foot' },
    specs: [
      { label: 'Base material', value: 'Polycarbonate' },
      { label: 'Spike material', value: 'Stainless steel' },
    ],
    applications: ['Window ledges', 'Parapet walls', 'Signboards', 'AC units'],
  },
  {
    id: 'bs-002',
    slug: 'plastic-bird-spike',
    name: 'Plastic Bird Spike',
    categorySlug: 'bird-spikes',
    shortDescription: 'UV stabilised plastic spikes for residential use.',
    fullDescription:
      'Affordable and effective UV stabilised plastic bird spikes, well suited to residential balconies and windowsills.',
    images: [img('plastic-bird-spike.jpg', 'UV stabilised plastic bird spikes on a residential windowsill')],
    price: { amount: 110, unit: 'running foot' },
    specs: [{ label: 'Material', value: 'UV stabilised polypropylene' }],
    applications: ['Residential balconies', 'Windowsills', 'Railings'],
  },

  // ── PP Rope ────────────────────────────────────────────────────────────
  {
    id: 'ppr-001',
    slug: 'braided-pp-rope',
    name: 'Braided PP Rope',
    categorySlug: 'pp-rope',
    shortDescription: 'High strength polypropylene braided rope.',
    fullDescription:
      'Versatile braided industrial rope used for securing cargo, tensioning nets and general site work.',
    images: [img('braided-pp-rope.jpg', 'Coil of braided polypropylene rope')],
    specs: [{ label: 'Material', value: 'Polypropylene' }],
    applications: ['Net tensioning', 'Cargo securing', 'General site use'],
  },
  {
    id: 'ppr-002',
    slug: 'twisted-pp-safety-rope',
    name: 'Twisted PP Safety Rope',
    categorySlug: 'pp-rope',
    shortDescription: 'Safety grade twisted rope for construction.',
    fullDescription:
      'Strong and reliable twisted polypropylene rope used in height safety systems and net anchoring.',
    images: [img('twisted-pp-safety-rope.jpg', 'Twisted polypropylene safety rope')],
    specs: [{ label: 'Material', value: 'Polypropylene' }],
    applications: ['Height safety systems', 'Net anchoring', 'Barricading'],
  },

  // ── Shade Nets ─────────────────────────────────────────────────────────
  {
    id: 'shn-001',
    slug: 'agri-shade-net-75',
    name: 'Agri Shade Net — 75%',
    categorySlug: 'shade-nets',
    shortDescription: 'Agriculture grade sun protection netting.',
    fullDescription:
      'Green shade netting for nurseries and agricultural greenhouses, reducing direct sunlight while allowing airflow.',
    images: [img('agri-shade-net-75.jpg', 'Green agricultural shade net over a plant nursery')],
    specs: [{ label: 'Shade factor', value: '75%' }],
    applications: ['Plant nurseries', 'Greenhouses', 'Terrace gardens'],
  },
  {
    id: 'shn-002',
    slug: 'car-parking-shade-mesh',
    name: 'Car Parking Shade Mesh',
    categorySlug: 'shade-nets',
    shortDescription: 'Premium shade mesh for vehicle shelters.',
    fullDescription:
      'Durable tensioned shade mesh that reduces heat build-up in open parking areas and protects vehicle paintwork.',
    images: [img('car-parking-shade-mesh.jpg', 'Tensioned shade mesh over an open car parking area')],
    applications: ['Society parking', 'Commercial parking', 'Showroom forecourts'],
    featured: true,
  },
  {
    id: 'shn-003',
    slug: 'privacy-fence-shade',
    name: 'Privacy Fence Shade',
    categorySlug: 'shade-nets',
    shortDescription: 'Privacy netting for residential fences.',
    fullDescription:
      'Blocks outside visibility while allowing airflow through. Commonly fitted to garden fences, terraces and compound walls.',
    images: [img('privacy-fence-shade.jpg', 'Privacy shade netting fitted along a garden fence')],
    applications: ['Garden fences', 'Terraces', 'Compound walls'],
  },

  // ── Monsoon Sheds ──────────────────────────────────────────────────────
  {
    id: 'ms-001',
    slug: 'industrial-monsoon-shed',
    name: 'Industrial Monsoon Shed',
    categorySlug: 'monsoon-shed',
    shortDescription: 'Heavy duty rain protection sheds.',
    fullDescription:
      'Custom fabricated monsoon sheds for storage areas and loading bays, designed and installed to suit the site.',
    images: [img('industrial-monsoon-shed.jpg', 'Industrial monsoon shed covering a loading bay')],
    applications: ['Loading bays', 'Storage yards', 'Open work areas', 'Society entrances'],
  },

  // ── PE Tarpaulin ───────────────────────────────────────────────────────
  {
    id: 'pt-001',
    slug: 'blue-pe-tarpaulin',
    name: 'Blue PE Tarpaulin',
    categorySlug: 'pe-tarpaulin',
    shortDescription: 'Waterproof PE tarpaulin for general use.',
    fullDescription:
      'Lightweight yet strong waterproof cover suitable for a wide range of protective applications.',
    images: [img('blue-pe-tarpaulin.jpg', 'Blue polyethylene tarpaulin sheet')],
    specs: [{ label: 'Material', value: 'Polyethylene (PE)' }],
    applications: ['Goods covering', 'Temporary roofing', 'Site protection'],
  },
  {
    id: 'pt-002',
    slug: 'heavy-duty-hdpe-tarpaulin',
    name: 'Heavy Duty HDPE Tarpaulin',
    categorySlug: 'pe-tarpaulin',
    shortDescription: 'Reinforced high-GSM tarpaulin for vehicle covers.',
    fullDescription:
      'High GSM reinforced tarpaulin offering maximum protection against rain and sun. Used for vehicle and machinery covers.',
    images: [img('heavy-duty-hdpe-tarpaulin.jpg', 'Heavy duty HDPE tarpaulin covering machinery')],
    specs: [{ label: 'Material', value: 'HDPE, high GSM' }],
    applications: ['Vehicle covers', 'Machinery covers', 'Long-term outdoor storage'],
  },

  // ── Sports Nets ────────────────────────────────────────────────────────
  {
    id: 'spn-001',
    slug: 'cricket-box-net',
    name: 'Cricket Box Net',
    categorySlug: 'sports-nets',
    shortDescription: 'Fully enclosed cricket practice net.',
    fullDescription:
      'Complete box enclosure for cricket practice, supplied and installed with the supporting structure.',
    images: [img('cricket-box-net.jpg', 'Enclosed cricket practice net box')],
    applications: ['Cricket academies', 'Schools and colleges', 'Society grounds', 'Turf grounds'],
    featured: true,
  },
  {
    id: 'spn-002',
    slug: 'football-goal-post-net',
    name: 'Football Goal Post Net',
    categorySlug: 'sports-nets',
    shortDescription: 'Heavy duty goal post netting.',
    fullDescription: 'Weatherproof nylon netting for professional and club goal posts.',
    images: [img('football-goal-post-net.jpg', 'Football goal post fitted with a nylon net')],
    applications: ['Football grounds', 'Turf facilities', 'Schools'],
  },
  {
    id: 'spn-003',
    slug: 'tennis-boundary-net',
    name: 'Tennis Boundary Net',
    categorySlug: 'sports-nets',
    shortDescription: 'Wide span boundary netting for courts.',
    fullDescription:
      'Tall boundary netting for tennis, volleyball and multi-sport courts, keeping play contained within the facility.',
    images: [img('tennis-boundary-net.jpg', 'Tall boundary netting around a tennis court')],
    applications: ['Tennis courts', 'Volleyball courts', 'Multi-sport facilities'],
  },

  // ── Football Turf ──────────────────────────────────────────────────────
  {
    id: 'ft-001',
    slug: 'professional-football-ground-turf',
    name: 'Professional Football Ground Turf',
    categorySlug: 'football-turf',
    shortDescription: 'Professional grade football turf, supplied and laid.',
    fullDescription:
      'High performance sports turf designed for heavy footfall and player safety, including base preparation and installation.',
    images: [img('professional-football-ground-turf.jpg', 'Professional football turf pitch')],
    applications: ['Turf grounds', 'Five-a-side pitches', 'Sports academies'],
    featured: true,
  },

  // ── Artificial Grass ───────────────────────────────────────────────────
  {
    id: 'ag-001',
    slug: 'premium-artificial-grass-40mm',
    name: 'Premium Artificial Grass — 40mm',
    categorySlug: 'artificial-grass',
    shortDescription: 'Lush 40mm landscape grass.',
    fullDescription:
      'Realistic look and feel with a 40mm pile height. Maintenance free artificial turf for gardens and landscaping.',
    images: [img('premium-artificial-grass-40mm.jpg', '40mm premium artificial landscape grass')],
    specs: [{ label: 'Pile height', value: '40 mm' }],
    applications: ['Gardens', 'Landscaping', 'Villa lawns'],
  },
  {
    id: 'ag-002',
    slug: 'artificial-lawn-grass',
    name: 'Artificial Lawn Grass',
    categorySlug: 'artificial-grass',
    shortDescription: 'Multi-purpose lawn grass for rooftops.',
    fullDescription:
      'High density fibres with excellent drainage, well suited to terrace gardens and rooftop lawns.',
    images: [img('artificial-lawn-grass.jpg', 'Artificial lawn grass laid on a terrace')],
    applications: ['Terrace gardens', 'Rooftop lawns', 'Balconies'],
  },

  // ── Carpet Grass ───────────────────────────────────────────────────────
  {
    id: 'cg-001',
    slug: 'carpet-grass-roll',
    name: 'Carpet Grass Roll',
    categorySlug: 'carpet-grass',
    shortDescription: 'Easy to install grass rolls for events.',
    fullDescription:
      'Portable and durable grass carpet rolls for indoor and outdoor events, exhibitions and temporary installations.',
    images: [img('carpet-grass-roll.jpg', 'Roll of carpet grass being laid out')],
    applications: ['Events', 'Exhibitions', 'Wedding venues', 'Temporary displays'],
  },

  // ── Grass Mats ─────────────────────────────────────────────────────────
  {
    id: 'gm-001',
    slug: 'decorative-grass-mats',
    name: 'Decorative Grass Mats',
    categorySlug: 'grass-mats',
    shortDescription: 'Interlocking grass mats for balconies.',
    fullDescription:
      'Small modular interlocking grass tiles that allow a quick balcony or patio makeover without any fixing work.',
    images: [img('decorative-grass-mats.jpg', 'Interlocking decorative grass mats on a balcony floor')],
    applications: ['Balconies', 'Patios', 'Small terraces'],
  },

  // ── Nylon Hammock ──────────────────────────────────────────────────────
  {
    id: 'nh-001',
    slug: 'nylon-hammock-hanging-mesh-net',
    name: 'Nylon Hammock Hanging Mesh Net',
    categorySlug: 'nylon-hammock',
    shortDescription: 'Strong nylon hanging mesh.',
    fullDescription:
      'High-tensile strength nylon rope mesh used for hammocks, adventure zones and play area netting.',
    images: [img('nylon-hammock-hanging-mesh-net.jpg', 'Nylon rope hammock mesh net')],
    specs: [{ label: 'Material', value: 'Nylon rope' }],
    applications: ['Hammocks', 'Adventure zones', 'Play areas'],
  },
];

// ── Lookups ──────────────────────────────────────────────────────────────

export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const productsInCategory = (categorySlug: string): Product[] =>
  PRODUCTS.filter((p) => p.categorySlug === categorySlug);

export const featuredProducts = (): Product[] => PRODUCTS.filter((p) => p.featured);

export const countByCategory = (categorySlug: string): number =>
  productsInCategory(categorySlug).length;

/**
 * Lightweight client-side search across name, description and applications.
 * Adequate for 25 products; swap for a proper index only if the catalogue
 * grows past a few hundred items.
 */
export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) =>
    [p.name, p.shortDescription, p.fullDescription, ...(p.applications ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
};


// ── Home page hero ───────────────────────────────────────────────────────

/**
 * The four products shown in the hero cluster on the home page.
 *
 * The client picks these — they are his shop window, and they are expected to
 * change with the season (shade nets before summer, monsoon sheds before the
 * rains). Change the four slugs below and nothing else needs touching.
 *
 * Exactly four. The cluster layout has four seats; a fifth would overlap and
 * three would leave a visible gap.
 */
export const HERO_PRODUCT_SLUGS = [
  'construction-fall-safety-net',
  'cricket-box-net',
  'premium-artificial-grass-40mm',
  'stainless-steel-bird-spike',
] as const;

/**
 * Hero photographs are NOT the same files as the catalogue photographs.
 *
 * The catalogue uses ordinary rectangular photos. The hero needs the product
 * cut out against transparency — a .png with a real alpha channel — so it
 * floats over the green background instead of sitting in a visible box. A
 * rectangular photo here is what makes a site look like a template.
 *
 * Shoot on any plain background, remove it, export PNG. Roughly square
 * framing with a little breathing room: the four seats assume similar
 * proportions, so one very wide and one very tall product unbalances it.
 */
export const HERO_IMAGES: Record<string, ProductImage> = {
  'construction-fall-safety-net': {
    src: '/images/hero/construction-fall-safety-net.png',
    alt: 'Roll of green construction safety netting',
  },
  'cricket-box-net': {
    src: '/images/hero/cricket-box-net.png',
    alt: 'Cricket practice net panel on its steel frame',
  },
  'premium-artificial-grass-40mm': {
    src: '/images/hero/premium-artificial-grass-40mm.png',
    alt: 'Square of 40mm artificial grass turf',
  },
  'stainless-steel-bird-spike': {
    src: '/images/hero/stainless-steel-bird-spike.png',
    alt: 'Strip of stainless steel bird spikes',
  },
};

export interface HeroProduct {
  product: Product;
  image: ProductImage;
}

/** The hero four, resolved to real products. Silently skips a bad slug. */
export const heroProducts = (): HeroProduct[] =>
  HERO_PRODUCT_SLUGS.map((slug) => {
    const product = getProduct(slug);
    const image = HERO_IMAGES[slug];
    return product && image ? { product, image } : null;
  }).filter((x): x is HeroProduct => x !== null);

/**
 * Shot list to hand to the client. Every product needs at least one real
 * photograph before launch — stock imagery on a safety equipment site
 * undermines exactly the credibility we are trying to build.
 */
export const PHOTO_MANIFEST = PRODUCTS.map((p) => ({
  product: p.name,
  file: p.images[0].src.split('/').pop(),
  suggestedShot: p.images[0].alt,
}));
