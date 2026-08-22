import Link from 'next/link';
import { SITE } from '@/lib/site';
import { CATEGORIES } from '@/lib/categories';
import { countByCategory, featuredProducts, PRODUCTS } from '@/lib/products';
import { WORKFLOW } from '@/lib/services';
import { quickWhatsAppUrl } from '@/lib/enquiry';
import ProductCard from '@/components/ProductCard';
import { CheckIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';

const HERO_BADGES = [
  'Own installation team',
  'Free site survey',
  'Garware & Maruti ropes',
  'Insured & GST registered',
];

export default function HomePage() {
  const featured = featuredProducts();
  // Show the six busiest categories; the rest are one click away.
  const topCategories = CATEGORIES.filter((c) => countByCategory(c.slug) > 0).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="eyebrow" style={{ color: 'var(--green-300)' }}>
            ISO 9001:2015 · Government Certified
          </span>
          <h1>Safety netting, engineered and installed across India.</h1>
          <p className="hero__lead">
            Construction safety nets, bird proofing, cricket and football nets, shade
            systems and artificial turf — surveyed, designed and fitted by our own team
            from {SITE.branches.length} branches nationwide.
          </p>

          <div className="hero__actions">
            <Link className="btn btn--accent btn--lg" href="/products">
              Browse Products
            </Link>
            <a className="btn btn--outline btn--lg" href={`tel:+${SITE.contact.phoneE164}`}>
              <PhoneIcon size={18} />
              {SITE.contact.phoneDisplay}
            </a>
          </div>

          <div className="hero__badges">
            {HERO_BADGES.map((b) => (
              <span className="hero__badge" key={b}>
                <CheckIcon size={16} />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <div className="stat__value">{SITE.branches.length}</div>
              <div className="stat__label">Branches across India</div>
            </div>
            <div className="stat">
              <div className="stat__value">{PRODUCTS.length}+</div>
              <div className="stat__label">Products in catalogue</div>
            </div>
            <div className="stat">
              <div className="stat__value">ISO</div>
              <div className="stat__label">9001:2015 certified</div>
            </div>
            <div className="stat">
              <div className="stat__value">24h</div>
              <div className="stat__label">Quotation response</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What we supply</span>
            <h2>Find what you need in three clicks, not fourteen.</h2>
            <p className="lead">
              Our catalogue is grouped by what you are trying to solve — protect
              something, cover something, or build a playing surface.
            </p>
          </div>

          <div className="grid grid--3">
            {topCategories.map((c) => (
              <Link className="cat-card" href={`/products?category=${c.slug}`} key={c.slug}>
                <div className="cat-card__top">
                  <span className="cat-card__name">{c.name}</span>
                  <span className="cat-card__count">{countByCategory(c.slug)} items</span>
                </div>
                <p className="cat-card__blurb">{c.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Most requested</span>
            <h2>Popular solutions</h2>
          </div>
          <div className="grid grid--4">
            {featured.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How we work</span>
            <h2>We engineer safety systems, we don&rsquo;t just sell netting.</h2>
          </div>
          <div className="steps">
            {WORKFLOW.map((s, i) => (
              <div className={`step${i === 0 ? ' step--active' : ''}`} key={s.step}>
                <div className="step__num">{s.step}</div>
                <div className="step__title">{s.title}</div>
                <p className="step__detail">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--brand">
        <div className="container" style={{ textAlign: 'center', maxWidth: '44rem' }}>
          <h2>Need a quotation?</h2>
          <p
            className="lead"
            style={{ margin: 'var(--space-4) auto var(--space-6)' }}
          >
            Send us your requirement on WhatsApp or by email. We respond with a
            professional quotation within one business day.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <a
              className="btn btn--whatsapp btn--lg"
              href={quickWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={20} />
              Enquire on WhatsApp
            </a>
            <Link className="btn btn--outline btn--lg" href="/contact">
              Contact the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
