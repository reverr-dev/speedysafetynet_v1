import { SITE } from '@/lib/site';
import { quickWhatsAppUrl, telLink } from '@/lib/enquiry';
import { PhoneIcon, WhatsAppIcon } from './Icons';

/**
 * Floating WhatsApp button plus the sticky mobile call bar.
 *
 * A large share of visitors to a site like this simply want to ring someone.
 * Making them hunt for a number is the easiest lead to lose.
 */
export default function FloatingActions() {
  return (
    <>
      <a
        className="fab"
        href={quickWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${SITE.name} on WhatsApp`}
      >
        <WhatsAppIcon size={28} />
      </a>

      <div className="action-bar">
        <a className="action-bar__btn action-bar__btn--call" href={telLink()}>
          <PhoneIcon size={18} />
          Call Now
        </a>
        <a
          className="action-bar__btn action-bar__btn--wa"
          href={quickWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} />
          WhatsApp
        </a>
      </div>
    </>
  );
}
