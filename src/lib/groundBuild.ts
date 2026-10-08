import data from '../../content/ground-build.json';

/**
 * Football and cricket ground construction.
 *
 * Every figure here comes from the client's own quotation, transcribed
 * unchanged. Prose spelling was corrected; not one specification was altered,
 * rounded or filled in. Where his sheet was ambiguous, the ambiguity is
 * recorded in `_unconfirmed` in the JSON rather than resolved by guesswork —
 * inventing a number for sports safety equipment is not a small thing.
 *
 * Rates are deliberately "from" figures. The client asked for indicative
 * pricing rather than firm, which is the right call: area, access and ground
 * condition all move the real number, and a firm price published on a website
 * becomes a figure customers negotiate down from.
 */

export interface BuildStage {
  /** Stable enquiry id. Derived from the stage, not its display name, so a
      basket saved in localStorage still resolves after a rename. */
  id: string;
  number: string;
  title: string;
  summary: string;
  detail: string[];
  fromRate: number;
  unit: string;
  /** null where the client's original photograph was too small to use. */
  image: string | null;
  alt: string | null;
}

export interface TurfSpec {
  id: string;
  name: string;
  note: string;
  pileHeight: string;
  gauge: string;
  density: string;
  stitches: string;
  infill: string;
  warrantyYears: number;
  fromRate: number;
  bestFor: string;
}

export interface NetSpec {
  id: string;
  name: string;
  thickness: string;
  mesh: string;
  borderRope: string;
  warrantyYears: number;
  fromRate: number;
}

export const GROUND_BUILD = {
  slug: data.slug,
  title: data.title,
  summary: data.summary,
  rateNote: data.rateNote,
  banner: data.banner as { image: string; alt: string },
  stages: data.stages as BuildStage[],
  turf: data.turf as TurfSpec[],
  nets: data.nets as NetSpec[],
};

/**
 * Indian digit grouping — 1,10,000 rather than 110,000.
 *
 * Not cosmetic. To a Mumbai contractor reading a price, Western grouping looks
 * like a foreign template, and looking foreign is the opposite of what a local
 * trade site needs to do.
 */
export function rupees(amount: number): string {
  const fixed = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const [whole, decimal] = fixed.split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`
    : last3;
  return decimal ? `${grouped}.${decimal}` : grouped;
}

/** "from ₹85 / sq ft" */
export const fromRate = (amount: number, unit: string): string =>
  `from ₹${rupees(amount)} / ${unit}`;
