'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_GROUPS, categoriesByGroup } from '@/lib/categories';
import { PRODUCTS, countByCategory } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { CloseIcon, SearchIcon } from '@/components/Icons';

/**
 * The catalogue browser.
 *
 * The old demo showed 14 flat filter chips in a row, so finding a balcony net
 * meant reading every label. Categories are grouped into three buying intents
 * here, and a search box covers people who already know what they want.
 *
 * Filtering runs client-side over 25 products — instant, and it keeps the page
 * a static file with no server behind it.
 */
export default function ProductBrowser({ initialCategory }: { initialCategory?: string }) {
  const [active, setActive] = useState<string | null>(
    initialCategory && CATEGORIES.some((c) => c.slug === initialCategory)
      ? initialCategory
      : null,
  );
  const [query, setQuery] = useState('');

  /*
   * Whether the category list is expanded. Phone only — on a wide screen the
   * list is a permanent sidebar and this is ignored.
   *
   * Closed by default, and that is the whole point of this change. The
   * sidebar used to stack above the grid on a narrow screen, so arriving at
   * the catalogue on a phone meant scrolling past fifteen category names
   * before seeing a single product. Somebody who came to look at safety nets
   * was shown a table of contents instead.
   *
   * Now the products are the first thing on screen and the categories are one
   * tap away, which is the right order: browsing is the default, filtering is
   * the exception.
   */
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (active && p.categorySlug !== active) return false;
      if (!q) return true;
      return [p.name, p.shortDescription, p.fullDescription, ...(p.applications ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [active, query]);

  const activeName = active ? CATEGORIES.find((c) => c.slug === active)?.name : null;

  /**
   * Picking a category closes the list on a phone.
   *
   * Leaving it open would mean the visitor taps a category and still cannot
   * see what they chose — the results are below a list that is still covering
   * them. Closing shows the answer immediately, which is what the tap asked
   * for.
   */
  const choose = (slug: string | null) => {
    setActive(slug);
    setFiltersOpen(false);
  };

  return (
    <div className="catalogue">
      <aside className="filters">
        <div className="filters__bar">
          <div className="search">
            <SearchIcon className="search__icon" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
          </div>

          {/* Phone only — CSS hides it once the sidebar is permanent. */}
          <button
            type="button"
            className="filters__toggle"
            aria-expanded={filtersOpen}
            aria-controls="category-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Categories
            {active && <span className="filters__toggle-count">1</span>}
            <span className={`filters__caret${filtersOpen ? ' filters__caret--up' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* The chosen category, shown as a removable chip.
            Someone who arrives here by tapping a category on the home page
            needs to see straight away that they are looking at a filtered
            list — otherwise a short list reads as "they only sell three
            things" rather than "three things in this category". */}
        {activeName && (
          <div className="filters__active">
            <button type="button" className="chip chip--active" onClick={() => choose(null)}>
              {activeName}
              <CloseIcon size={13} />
              <span className="sr-only">Remove this filter</span>
            </button>
          </div>
        )}

        <div
          id="category-filters"
          className={`filters__panel${filtersOpen ? ' filters__panel--open' : ''}`}
        >
          <div>
            <div className="filter-group__title">Categories</div>
          <div className="filter-list">
            <button
              className="filter-list__item"
              aria-pressed={active === null}
              onClick={() => choose(null)}
            >
              <span>All products</span>
              <span className="filter-list__count">{PRODUCTS.length}</span>
            </button>
          </div>
        </div>

        {CATEGORY_GROUPS.map((group) => {
          const cats = categoriesByGroup(group).filter((c) => countByCategory(c.slug) > 0);
          if (cats.length === 0) return null;
          return (
            <div key={group}>
              <div className="filter-group__title">{group}</div>
              <div className="filter-list">
                {cats.map((c) => (
                  <button
                    key={c.slug}
                    className="filter-list__item"
                    aria-pressed={active === c.slug}
                    onClick={() => choose(active === c.slug ? null : c.slug)}
                  >
                    <span>{c.name}</span>
                    <span className="filter-list__count">{countByCategory(c.slug)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </aside>

      <div>
        <div className="results-bar">
          <span aria-live="polite">
            Showing <strong>{results.length}</strong>{' '}
            {results.length === 1 ? 'product' : 'products'}
            {activeName ? ` in ${activeName}` : ''}
            {query.trim() ? ` matching “${query.trim()}”` : ''}
          </span>
          {(active || query) && (
            <button
              className="btn btn--outline"
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 'var(--text-sm)' }}
              onClick={() => {
                setActive(null);
                setQuery('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid--3">
            {results.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No products match that search</h3>
            <p style={{ marginBottom: 'var(--space-5)' }}>
              We supply a great deal more than is listed here. Tell us what you need and
              we will source it.
            </p>
            <button
              className="btn btn--primary"
              onClick={() => {
                setActive(null);
                setQuery('');
              }}
            >
              Show all products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
