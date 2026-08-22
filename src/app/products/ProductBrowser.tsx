'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_GROUPS, categoriesByGroup } from '@/lib/categories';
import { PRODUCTS, countByCategory } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { SearchIcon } from '@/components/Icons';

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

  return (
    <div className="catalogue">
      <aside className="filters">
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

        <div>
          <div className="filter-group__title">Categories</div>
          <div className="filter-list">
            <button
              className="filter-list__item"
              aria-pressed={active === null}
              onClick={() => setActive(null)}
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
                    onClick={() => setActive(active === c.slug ? null : c.slug)}
                  >
                    <span>{c.name}</span>
                    <span className="filter-list__count">{countByCategory(c.slug)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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
