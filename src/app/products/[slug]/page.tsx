import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProduct, productsInCategory } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { SITE } from '@/lib/site';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import AddToEnquiry from './AddToEnquiry';

interface Params {
  params: Promise<{ slug: string }>;
}

/** Pre-renders one static HTML file per product at build time. */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Product not found' };

  const category = getCategory(product.categorySlug);
  return {
    title: `${product.name}${category ? ` — ${category.name}` : ''}`,
    description: product.fullDescription.slice(0, 158),
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description: product.shortDescription,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const related = productsInCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 3);


  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <Link href="/products">Products</Link>
          {category && (
            <>
              <span className="crumbs__sep">/</span>
              <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
            </>
          )}
          <span className="crumbs__sep">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="enquiry-layout">
            <div>
              {/* Shows a thumbnail strip automatically once a product has more
                  than one photograph. */}
              <ProductGallery images={product.images} />

              {category && <span className="eyebrow">{category.name}</span>}
              <h1 style={{ marginBottom: 'var(--space-4)' }}>{product.name}</h1>
              <p className="lead" style={{ marginBottom: 'var(--space-6)' }}>
                {product.fullDescription}
              </p>

              {product.price && (
                <p
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-brand)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  ₹{product.price.amount}{' '}
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--weight-normal)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    per {product.price.unit} — indicative, confirmed on survey
                  </span>
                </p>
              )}

              {product.specs && product.specs.length > 0 && (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                    Specification
                  </h2>
                  <ul className="service-card__list">
                    {product.specs.map((s) => (
                      <li key={s.label}>
                        <strong>{s.label}:</strong>&nbsp;{s.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.applications && product.applications.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                    Typical applications
                  </h2>
                  <ul className="service-card__list">
                    {product.applications.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <AddToEnquiry product={product} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Related</span>
              <h2>More in {category?.name}</h2>
            </div>
            <div className="grid grid--3">
              {related.map((p) => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
