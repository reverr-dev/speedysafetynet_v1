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
