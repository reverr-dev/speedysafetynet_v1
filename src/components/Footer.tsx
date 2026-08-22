import Link from 'next/link';
import { NAV, SITE, addressOneLine } from '@/lib/site';
import { SERVICES } from '@/lib/services';
import { MailIcon, PhoneIcon, PinIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <span className="logo__mark">SSN</span>
              <span className="logo__text">
                <span className="logo__name">{SITE.name}</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)' }}>{SITE.description}</p>
          </div>

          <div>
            <h3>Explore</h3>
            <ul className="footer__list">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Our Services</h3>
            <ul className="footer__list">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Get in touch</h3>
            <ul className="footer__list">
              <li>
                <PinIcon size={16} />
                <span>{addressOneLine()}</span>
              </li>
              <li>
                <PhoneIcon size={16} />
                <a href={`tel:+${SITE.contact.landlineE164}`}>
                  {SITE.contact.landlineDisplay}
                </a>
              </li>
              <li>
                <PhoneIcon size={16} />
                <a href={`tel:+${SITE.contact.phoneE164}`}>
                  {SITE.contact.phoneDisplay}
                </a>
              </li>
              <li>
                <MailIcon size={16} />
                <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {SITE.name}. GST {SITE.gst}
          </span>
          <div className="footer__certs">
            <span className="cert-badge">ISO 9001:2015</span>
            <span className="cert-badge">Government Certified</span>
            <span className="cert-badge">Insured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
