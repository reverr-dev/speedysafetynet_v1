import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: '38rem' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          Error 404
        </span>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>We couldn&rsquo;t find that page</h1>
        <p className="lead" style={{ margin: '0 auto var(--space-6)' }}>
          The page may have moved. Try the catalogue, or call us and we will point you in
          the right direction.
        </p>
        <div className="hero__actions" style={{ justifyContent: 'center' }}>
          <Link className="btn btn--primary btn--lg" href="/products">
            Browse products
          </Link>
          <Link className="btn btn--outline btn--lg" href="/contact">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
