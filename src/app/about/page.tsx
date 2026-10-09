import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SITE,
  ABOUT_UNCONFIRMED,
  DIRECTOR,
  PORTFOLIO_UNCONFIRMED,
  addressOneLine,
  branchesOneLine,
} from '@/lib/site';
import { CATEGORIES } from '@/lib/categories';
import { PRODUCTS } from '@/lib/products';
import { BadgeCheckIcon, CheckIcon, PinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About — ISO 9001:2015 Certified Netting Manufacturer',
  description:
    `Speed Safety Nets is an ISO 9001:2015 certified supplier and installer of safety netting, headquartered in Mumbai with branches in ${branchesOneLine()}.`,
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
    title: `Present in ${SITE.branches.length} cities`,
    detail:
      `Branches in ${branchesOneLine(true)} mean we can service multi-site contracts without relying on local intermediaries.`,
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

      {/*
        The director, and what the business actually is.

        The client asked for "information regarding the business portfolio"
        and sent a photograph with no text. Everything written below is drawn
        from facts already established on this site — the certification, the
        branch network, the catalogue, the in-house installation — and nothing
        is invented. The figures he has not given (founding year, projects
        completed, team size, named clients) live in PORTFOLIO_UNCONFIRMED and
        each sentence is skipped while its value is null, so this section is
        safe to publish today and gets stronger as he fills them in.
      */}
      <section className="section section--alt">
        <div className="container">
          <div className="director">
            <div className="director__media">
              {/* eslint-disable-next-line @next/next/no-img-element -- the
                  static export runs images unoptimized, so next/image adds
                  nothing here. */}
              <img
                src={DIRECTOR.photo}
                alt={DIRECTOR.alt}
                width={1086}
                height={758}
                loading="lazy"
              />
            </div>

            <div className="director__body">
              <span className="eyebrow">Our portfolio</span>
              <h2>The business behind the nets</h2>

              <p>
                {SITE.name} manufactures, supplies and installs safety netting
                and allied systems from a head office in Mumbai and{' '}
                {SITE.branches.length - 1} further branches across Maharashtra,
                Gujarat and Delhi
                {PORTFOLIO_UNCONFIRMED.foundingYear
                  ? `, trading since ${PORTFOLIO_UNCONFIRMED.foundingYear}`
                  : ''}
                . The range runs from construction fall-arrest and balcony nets
                through bird proofing, invisible grills, shade nets, monsoon
                sheds and tarpaulins, to sports nets, football turf and
                artificial grass.
              </p>

              <p>
                Every job is surveyed, supplied and fitted by our own team
                rather than passed to a subcontractor
                {PORTFOLIO_UNCONFIRMED.teamSize
                  ? ` of ${PORTFOLIO_UNCONFIRMED.teamSize} people`
                  : ''}
                . It is the reason we take on complete sports grounds end to
                end — civil base, turf, perimeter netting, padding and
                branding — rather than supplying the netting and leaving the
                rest to somebody else.
                {PORTFOLIO_UNCONFIRMED.projectsCompleted
                  ? ` Over ${PORTFOLIO_UNCONFIRMED.projectsCompleted} installations completed to date.`
                  : ''}
              </p>

              <p>
                The company is ISO 9001:2015 certified and GST registered
                {SITE.gst ? ` under ${SITE.gst}` : ''}.
                {PORTFOLIO_UNCONFIRMED.notableClients
                  ? ` Clients include ${PORTFOLIO_UNCONFIRMED.notableClients.join(', ')}.`
                  : ''}
              </p>

              <figcaption className="director__name">
                {DIRECTOR.name ? (
                  <>
                    <strong>{DIRECTOR.name}</strong>
                    <span>{DIRECTOR.role}</span>
                  </>
                ) : (
                  <strong>{DIRECTOR.role}</strong>
                )}
              </figcaption>
            </div>
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
