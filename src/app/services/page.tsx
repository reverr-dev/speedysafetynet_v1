import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICES, WORKFLOW, PROJECTS } from '@/lib/services';
import { getCategory } from '@/lib/categories';
import { quickWhatsAppUrl } from '@/lib/enquiry';
import ProductImage from '@/components/ProductImage';
import GroundBuild from '@/components/GroundBuild';
import { SERVICE_ICONS, ArrowRightIcon, WhatsAppIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Services — Installation, Bird Proofing, Sports Grounds & Green Walls',
  description:
    'Construction safety netting, bird proofing, sports ground infrastructure, shading and monsoon sheds, artificial grass and green walls. Surveyed, designed and installed by our own team.',
};

export default function ServicesPage() {
  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span aria-current="page">Services</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What we do</span>
            <h1>We engineer safety systems, not just supply netting.</h1>
            <p className="lead">
              Every installation begins with a site visit. We measure, assess the load
              path and design around your structure — then our own trained team fits it.
              We do not subcontract installation.
            </p>
          </div>

          <div className="grid grid--3">
            {SERVICES.map((service) => {
              const Icon = SERVICE_ICONS[service.icon];
              return (
                <div className="service-card" id={service.slug} key={service.slug}>
                  <div className="service-card__icon">
                    <Icon size={24} />
                  </div>
                  <h2 style={{ fontSize: 'var(--text-lg)' }}>{service.title}</h2>
                  <p className="card__text">{service.summary}</p>

                  <ul className="service-card__list">
                    {service.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {service.relatedCategories.length > 0 && (
                    <Link
                      href={`/products?category=${service.relatedCategories[0]}`}
                      style={{
                        color: 'var(--color-brand)',
                        fontWeight: 'var(--weight-semibold)',
                        fontSize: 'var(--text-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'auto',
                        paddingTop: 'var(--space-3)',
                      }}
                    >
                      View products
                      <ArrowRightIcon size={14} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sports ground construction ──────────────────────────────────
          Placed before the gallery deliberately: it is the highest-value
          work the client does, and specification detail at this level is
          what a facility owner is actually comparing contractors on. */}
      <GroundBuild />

      {/* ── Our Work ────────────────────────────────────────────────────
          Completed outdoor installations. Every tile carries an
          "Enquire for this service" button, so a visitor who recognises
          their own problem in a photo can act on it immediately — that is
          the whole point of the gallery.                                */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our work</span>
            <h2>Installations we have completed</h2>
            <p className="lead">
              A sample of outdoor work across Mumbai and our branch cities. See something
              similar to what you need? Ask us for the same.
            </p>
          </div>

          <div className="grid grid--3">
            {PROJECTS.map((project) => {
              const category = project.categorySlug ? getCategory(project.categorySlug) : null;
              const enquiryHref = category
                ? `/products?category=${category.slug}`
                : '/contact';

              return (
                <article className="project" key={project.slug}>
                  <ProductImage
                    src={project.images[0].src}
                    alt={project.images[0].alt}
                  />

                  <div className="project__overlay">
                    <h3 className="project__title">{project.title}</h3>
                    <p className="project__meta">
                      {project.location}
                      {category ? ` · ${category.name}` : ''}
                    </p>
                    <Link className="project__cta" href={enquiryHref}>
                      Enquire for this service
                      <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                  <span className="sr-only">{project.summary}</span>
                </article>
              );
            })}
          </div>

          <p
            className="muted"
            style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)' }}
          >
            Project photographs to be supplied by the client before launch.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our process</span>
            <h2>From first call to handover</h2>
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
          <h2>Book a free site survey</h2>
          <p className="lead" style={{ margin: 'var(--space-4) auto var(--space-6)' }}>
            We visit, measure and quote — with no obligation. Most surveys are arranged
            within two working days.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <a
              className="btn btn--whatsapp btn--lg"
              href={quickWhatsAppUrl('a site survey')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={20} />
              Request on WhatsApp
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
