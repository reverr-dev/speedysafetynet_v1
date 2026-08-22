import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, ABOUT_UNCONFIRMED, addressOneLine } from '@/lib/site';
import { CATEGORIES } from '@/lib/categories';
import { PRODUCTS } from '@/lib/products';
import { BadgeCheckIcon, CheckIcon, PinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About — ISO 9001:2015 Certified Netting Manufacturer',
  description:
    'Speed Safety Nets is an ISO 9001:2015 certified supplier and installer of safety netting, headquartered in Mumbai with branches in Pune, Ahmedabad, Delhi and Surat.',
};

const VALUES = [
  {
    title: 'We install what we sell',
    detail:
      'Installation is done by our own trained team, not subcontracted. The person who quotes the job is accountable for how it is fitted.',
  },
  {
    title: 'Quality-approved materials',
    detail:
      'We work with established Indian rope and netting manufacturers rather than sourcing on price alone. Safety equipment is not a place to cut corners.',
  },
  {
    title: 'Standardised tensioning',
    detail:
      'Every net is fitted to a consistent standard for tensioning, anchoring and impact resistance, whatever the size of the job.',
  },
  {
    title: 'Present in five cities',
    detail:
      'Branches in Mumbai, Pune, Ahmedabad, Delhi and Surat mean we can service multi-site contracts without relying on local intermediaries.',
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span aria-current="page">About</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">About us</span>
            <h1>Netting is all we do.</h1>
            <p className="lead">
              {SITE.name} supplies and installs safety netting, bird control systems,
              sports nets, shade systems, artificial turf and green walls. We work with
              builders, facility managers, housing societies, sports facilities and
              homeowners{' '}
              {ABOUT_UNCONFIRMED.foundingYear
                ? `since ${ABOUT_UNCONFIRMED.foundingYear}`
                : 'across India'}
              .
            </p>
          </div>

          <div className="stats" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="stat">
              <div className="stat__value">{SITE.branches.length}</div>
              <div className="stat__label">Branch locations</div>
            </div>
            <div className="stat">
              <div className="stat__value">{CATEGORIES.length}</div>
              <div className="stat__label">Product categories</div>
            </div>
            <div className="stat">
              <div className="stat__value">{PRODUCTS.length}+</div>
              <div className="stat__label">Products supplied</div>
            </div>
            <div className="stat">
              <div className="stat__value">ISO</div>
              <div className="stat__label">9001:2015 certified</div>
            </div>
          </div>

          <div className="grid grid--2">
            {VALUES.map((v) => (
              <div className="service-card" key={v.title}>
                <div className="service-card__icon">
                  <CheckIcon size={22} />
                </div>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>{v.title}</h2>
                <p className="card__text">{v.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Credentials</span>
            <h2>Company details</h2>
          </div>

          <div className="grid grid--2">
            <div className="panel">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Registration</h3>
              <ul className="footer__list" style={{ color: 'var(--color-text)' }}>
                <li>
                  <strong>Business name:</strong>&nbsp;{SITE.name}
                </li>
                <li>
                  <strong>Proprietor:</strong>&nbsp;{SITE.proprietor}
                </li>
                <li>
                  <strong>GST number:</strong>&nbsp;{SITE.gst}
                </li>
                <li>
                  <strong>Insurance policy:</strong>&nbsp;{SITE.insurancePolicyNo}
                </li>
              </ul>
            </div>

            <div className="panel">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Certification</h3>
              <ul className="footer__list" style={{ color: 'var(--color-text)' }}>
                {SITE.certifications.map((c) => (
                  <li key={c.label}>
                    <BadgeCheckIcon size={18} />
                    <span>
                      <strong>{c.label}</strong> — {c.detail}
                    </span>
                  </li>
                ))}
                <li>
                  <PinIcon size={18} />
                  <span>{addressOneLine()}</span>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-7)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Where we operate</h3>
            <div className="branches">
              {SITE.branches.map((b) => (
                <span
                  className={`branch-chip${b.isHeadOffice ? ' branch-chip--head' : ''}`}
                  key={b.city}
                >
                  <PinIcon size={14} />
                  {b.city}
                  {b.isHeadOffice ? ' — Head Office' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--brand">
        <div className="container" style={{ textAlign: 'center', maxWidth: '44rem' }}>
          <h2>Work with us</h2>
          <p className="lead" style={{ margin: 'var(--space-4) auto var(--space-6)' }}>
            Tell us about your site and we will come and look at it.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <Link className="btn btn--accent btn--lg" href="/products">
              Browse products
            </Link>
            <Link className="btn btn--outline btn--lg" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
