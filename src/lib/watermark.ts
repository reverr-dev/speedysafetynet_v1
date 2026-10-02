import type { ProductImage } from './types';

/**
 * The class suffix that decides where — or whether — the corner watermark
 * appears over a picture.
 *
 * There is one rule in the business and it is not a design preference: every
 * product carries the company mark. So this returns a suppressing class for
 * one case only — a photograph that already has the identical gear device
 * burned into the identical corner by the old stamping script, where a second
 * one reads as a printing fault rather than as branding.
 *
 * Everything else gets the mark, including the client's own posters. Those
 * carry his logo somewhere in the artwork already, which is exactly why
 * `watermarkCorner` exists: the site's mark moves to a corner the poster
 * leaves plain instead of landing on top of what is printed there.
 *
 * Returned as a leading-space string so call sites can concatenate it
 * straight onto a className without a conditional of their own.
 */
export function markClass(image: Pick<ProductImage, 'watermark' | 'watermarkCorner'>): string {
  if (image.watermark === false) return ' media--unmarked';

  switch (image.watermarkCorner) {
    case 'top-left':
      return ' media--mark-tl';
    case 'top-right':
      return ' media--mark-tr';
    case 'bottom-left':
      return ' media--mark-bl';
    default:
      return '';
  }
}
