import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, addressOneLine } from '@/lib/site';
import { quickWhatsAppUrl } from '@/lib/enquiry';
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Contact — Mumbai Head Office & Branch Locations',
  description:
    'Call 022-6633 1119 or message us on WhatsApp. Head office at P D Mello Road, Princess Dock, Mumbai 400009, with branches in Pune, Ahmedabad, Delhi and Surat.',
};

/**
 * Google Maps embed.
 *
 * ⚠️ This is a generic Mumbai-area embed carried over from the old demo. Before
 * launch, replace with a pin on the actual shop — search the address on Google
 * Maps, Share → Embed a map, and paste the src here. A map that points at the
 * wrong place is worse than no map.
 */
const MAP_SRC =
  'https://www.google.com/maps?q=P+D+Mello+Road,+Princess+Dock,+Mumbai+400009&output=embed';

export default function ContactPage() {
  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span aria-current="page">Contact</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Get in touch</span>
            <h1>Talk to us about your site.</h1>
            <p className="lead">
              Call the office, message us on WhatsApp, or send your requirement through
              the enquiry list. Most enquiries are answered the same working day.
            </p>
          </div>

          <div className="grid grid--3">
            <div className="contact-card">
              <div className="contact-card__icon">
                <PhoneIcon size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)' }}>Call us</h2>
              <p className="card__text">Office landline, and mobile for site matters.</p>
              <p>
                <a href={`tel:+${SITE.contact.landlineE164}`}>
                  {SITE.contact.landlineDisplay}
                </a>
              </p>
              <p>
                <a href={`tel:+${SITE.contact.phoneE164}`}>{SITE.contact.phoneDisplay}</a>
              </p>
              {SITE.contact.altPhones.map((p) => (
                <p key={p.e164}>
                  <a href={`tel:+${p.e164}`}>{p.display}</a>
                </p>
              ))}
              <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                {SITE.hours}
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon">
                <WhatsAppIcon size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)' }}>WhatsApp</h2>
              <p className="card__text">
                Send photographs of the site and we can often quote without a visit.
              </p>
              <a
                className="btn btn--whatsapp"
                href={quickWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 'auto' }}
              >
                <WhatsAppIcon size={18} />
                Start a chat
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon">
                <MailIcon size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)' }}>Email</h2>
              <p className="card__text">
                Best for tenders, specifications and formal quotation requests.
              </p>
              <p>
                <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
              </p>
              <Link
                className="btn btn--outline"
                href="/enquiry"
                style={{ marginTop: 'auto' }}
              >
                Send an enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="grid grid--2" style={{ alignItems: 'start' }}>
            <div>
              <span className="eyebrow">Head office</span>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Visit us in Mumbai</h2>
              <ul className="footer__list" style={{ color: 'var(--color-text)' }}>
                <li>
                  <PinIcon size={18} />
                  <span>{addressOneLine()}</span>
                </li>
              </ul>

              <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Branch locations</h3>
              <div className="branches">
                {SITE.branches.map((b) => (
                  <span
                    className={`branch-chip${b.isHeadOffice ? ' branch-chip--head' : ''}`}
                    key={b.city}
                  >
                    <PinIcon size={14} />
                    {b.city}
                  </span>
                ))}
              </div>

              <p
                className="muted"
                style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)' }}
              >
                GST {SITE.gst}
              </p>
            </div>

            <div className="map-frame">
              <iframe
                src={MAP_SRC}
                title={`Map showing ${SITE.name} head office`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
