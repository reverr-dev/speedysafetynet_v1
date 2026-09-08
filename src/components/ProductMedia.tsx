'use client';

import { useEffect, useRef, useState } from 'react';
import ProductImage from './ProductImage';

/**
 * A product photograph that comes to life when you point at it.
 *
 * The still is always what loads. The clip is fetched only when a visitor
 * actually hovers, plays muted and looping while they stay, and rewinds to
 * the still when they leave — the way a video thumbnail behaves on YouTube.
 *
 * WHY IT IS BUILT THIS WAY
 *
 * The client sent 32 phone videos of his installations, 205 MB of them. Every
 * one is worth showing and none of them can be shipped as-is: his customers
 * are contractors and facility managers opening a link on mobile data in
 * Mumbai, and a page that quietly pulls even one 6 MB video before they have
 * asked for it is a page that does not load.
 *
 * So nothing is fetched up front. `preload="none"` means the browser is told,
 * explicitly, not to touch the file until we ask — and we only ask on the
 * first hover. A visitor who never hovers downloads exactly the photograph,
 * which is what they would have downloaded anyway.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It does not autoplay, anywhere, ever. Motion that starts on its own takes
 * the reader's attention away from the thing they were reading, and on a
 * catalogue page with a dozen cards it would be a slot machine.
 *
 * It does nothing on touch. A phone has no hover: browsers synthesise one on
 * tap, so a touch implementation would fire the moment someone taps through
 * to the product — spending their data on a video they did not ask for, on
 * the exact connection where that costs most. On a phone the card is a still,
 * and the product page is where the video belongs.
 *
 * It respects prefers-reduced-motion. For a visitor who has asked their
 * system for less movement, the clip never plays at all.
 */

interface Props {
  src: string;
  alt: string;
  /** Optional clip. Without one this behaves exactly like a plain photograph. */
  video?: string;
  priority?: boolean;
}

export default function ProductMedia({ src, alt, video, priority = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // `null` means "not decided yet" — it stays null through the server render
  // and the first client render, so the two match and React does not warn.
  const [canHover, setCanHover] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // A real pointer, and no request for reduced motion. Both are read once,
    // after mount, because neither exists on the server.
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const decide = () => setCanHover(pointer.matches && !motion.matches);
    decide();
    pointer.addEventListener('change', decide);
    motion.addEventListener('change', decide);
    return () => {
      pointer.removeEventListener('change', decide);
      motion.removeEventListener('change', decide);
    };
  }, []);

  const enter = () => {
    if (!video || !canHover) return;
    const el = ref.current;
    if (!el) return;
    // First hover is when the file is actually requested.
    if (!loaded) {
      el.load();
      setLoaded(true);
    }
    // play() rejects if the visitor moves away before it resolves, or if the
    // browser declines. Neither is worth reporting — the still is still there.
    void el.play().then(() => setPlaying(true)).catch(() => {});
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
  };

  return (
    <span className="media" onMouseEnter={enter} onMouseLeave={leave}>
      <ProductImage src={src} alt={alt} priority={priority} />

      {video && (
        // Shown only to pointer users, by CSS. Motion that arrives with no
        // warning reads as a glitch; a small label first makes it read as a
        // feature, and tells the visitor there is more here than a photograph.
        <span className="media__badge">
          <svg width="9" height="9" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
            <path d="M1 0.5 7 4 1 7.5Z" />
          </svg>
          Video
        </span>
      )}

      {video && canHover && (
        <video
          ref={ref}
          className={`media__clip${playing ? ' media__clip--on' : ''}`}
          // Silent, inline, looping — the three things that make a clip read
          // as a moving picture rather than as a video someone has to manage.
          muted
          loop
          playsInline
          preload="none"
          // No poster: the photograph underneath is the poster, and giving the
          // browser a second copy of it only doubles the download.
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
    </span>
  );
}
