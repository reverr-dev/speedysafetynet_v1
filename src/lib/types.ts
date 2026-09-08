export interface Category {
  /** URL segment — must be unique and stable, it is a permanent public URL. */
  slug: string;
  name: string;
  /** Shown on category cards and used as the SEO meta description. */
  blurb: string;
  /** Groups categories into the three top-level buying intents. */
  group: CategoryGroup;
  /** Ordering weight on the products page. Lower sorts first. */
  order: number;
}

export type CategoryGroup = 'Safety & Protection' | 'Shading & Covers' | 'Sports & Landscaping';

export interface ProductImage {
  src: string;
  alt: string;
  /**
   * Set to false to hide the corner watermark over this picture.
   *
   * Only for artwork that already carries the company mark in its own
   * pixels — the client's four posters do, and a second mark in the corner
   * lands next to the one he put there. Everything else leaves this alone
   * and gets the mark automatically.
   */
  watermark?: boolean;
  /**
   * Optional short clip that plays when a visitor points at this picture.
   *
   * Silent, looping, a few seconds long, and never fetched until the first
   * hover — see ProductMedia. Only for motion that shows something a
   * photograph cannot: turf being brushed, a ball hitting the net. A slow pan
   * across a still object earns nothing and costs the visitor a download.
   */
  video?: string;
}

export interface Product {
  /** Stable internal id, carried over from the previous system. */
  id: string;
  /** URL segment — permanent public URL, do not change after launch. */
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: string;
  images: ProductImage[];
  /**
   * Optional indicative price. Most items are quoted per site, so this is
   * deliberately optional — showing a wrong price is worse than showing none.
   */
  price?: {
    amount: number;
    unit: string;
  };
  /** Key-value specification rows. Client fills these via the admin panel. */
  specs?: { label: string; value: string }[];
  /** Typical use cases — strong for long-tail local search. */
  applications?: string[];
  /** Surfaces the item on the home page. */
  featured?: boolean;
}

export interface InquiryItem {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  /** Per-product requirement note, e.g. "40ft x 20ft, 3rd floor balcony". */
  note: string;
}

export interface InquiryForm {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  message: string;
  /** Honeypot. Must stay empty — bots fill it, humans never see it. */
  company?: string;
}

/** A completed installation shown in the Our Work gallery. */
export interface Project {
  slug: string;
  title: string;
  location: string;
  /** Category slug this project demonstrates — powers "enquire for this service". */
  categorySlug: string;
  summary: string;
  images: ProductImage[];
  /** Optional completion year. */
  year?: number;
}
