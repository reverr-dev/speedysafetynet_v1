'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ⚠️  DEMO TOOL — REMOVE BEFORE LAUNCH.
 *
 * Lets the client try each colour scheme on the live site rather than judging
 * from screenshots. Once he has chosen, copy that theme's --brand-* values
 * into the :root block in tokens.css as the new defaults, then delete:
 *   • this file
 *   • the two ThemeSwitcher lines in src/app/layout.tsx
 *   • the "THEME SWITCHER" section in src/styles/global.css
 *   • the [data-theme] blocks in src/styles/tokens.css
 * Nothing else references any of it.
 *
 * How it works: sets data-theme on <html>, which flips the --brand-* scale in
 * tokens.css. Every other colour on the site derives from that scale, so one
 * attribute repaints everything — header, buttons, cards, footer, the animated
 * net, all of it.
 *
 * Why a bar across the top rather than a floating button: a floating button in
 * the corner would sit on top of the sticky header and cover the enquiry
 * basket. A bar in the normal document flow pushes the page down instead of
 * covering it, and it is sticky so the client can switch schemes while looking
 * at any section. All five options are visible at once — comparing colours is
 * the whole point, and hiding four of them behind a dropdown works against it.
 *
 * The choice is remembered in localStorage so the client can browse the whole
 * site in one scheme instead of it resetting on every page.
 */

const THEMES = [
  { id: '', label: 'Green', hint: 'Visiting card', swatch: '#357f46' },
  { id: 'blue', label: 'Blue', hint: 'Industrial', swatch: '#2b6cb0' },
  { id: 'navy', label: 'Navy', hint: 'Corporate', swatch: '#12294d' },
  { id: 'orange', label: 'Orange', hint: 'Site safety', swatch: '#b84d17' },
  { id: 'white', label: 'White', hint: 'Minimal', swatch: '#ffffff' },
] as const;

const STORAGE_KEY = 'ssn_theme';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) ?? '';
      if (saved && THEMES.some((t) => t.id === saved)) apply(saved);
    } catch {
      // Private browsing blocks localStorage — just use the default theme.
    }
  }, []);

  /**
   * The site header is sticky at the top, and so is this bar. The header has
   * to stop exactly this bar's height lower or the two overlap.
   *
   * The height is measured rather than hard-coded because the five options
   * wrap onto a second row on a narrow phone — a fixed value would be wrong on
   * exactly the screens the client is most likely to check the site on.
   */
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const publish = () =>
      document.documentElement.style.setProperty(
        '--theme-bar-height',
        `${el.offsetHeight}px`,
      );

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--theme-bar-height');
    };
  }, []);

  function apply(id: string) {
    setTheme(id);
    if (id) document.documentElement.setAttribute('data-theme', id);
    else document.documentElement.removeAttribute('data-theme');
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* not fatal — the scheme just will not persist across pages */
    }
  }

  return (
    <div className="theme-bar" ref={barRef}>
      <div className="container theme-bar__inner">
        <span className="theme-bar__label">
          <strong>Preview</strong> — demo only
        </span>

        <div className="theme-bar__options" role="group" aria-label="Colour scheme">
          {THEMES.map((t) => (
            <button
              key={t.id || 'default'}
              type="button"
              className="theme-bar__option"
              aria-pressed={t.id === theme}
              onClick={() => apply(t.id)}
            >
              <span className="theme-bar__dot" style={{ background: t.swatch }} />
              <span className="theme-bar__name">{t.label}</span>
              <span className="theme-bar__hint">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
