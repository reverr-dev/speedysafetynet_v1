'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV, SITE } from '@/lib/site';
import { useEnquiry } from './EnquiryStore';
import { BadgeCheckIcon, BasketIcon, CloseIcon, MailIcon, MenuIcon, PhoneIcon } from './Icons';

export default function Header() {
  const pathname = usePathname();
  const { count, ready } = useEnquiry();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation, otherwise it stays open over the
  // new page and looks broken.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__group">
            <a className="topbar__item" href={`tel:+${SITE.contact.landlineE164}`}>
              <PhoneIcon size={14} />
              {SITE.contact.landlineDisplay}
            </a>
            <a
              className="topbar__item topbar__item--email"
              href={`mailto:${SITE.contact.email}`}
            >
              <MailIcon size={14} />
              {SITE.contact.email}
            </a>
          </div>
          <div className="topbar__group topbar__group--secondary">
            <span className="topbar__item">
              <BadgeCheckIcon size={14} />
              ISO 9001:2015 Certified
            </span>
            <span className="topbar__item">
              {SITE.branches.map((b) => b.city).join(' · ')}
            </span>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container header__inner">
          <Link className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- the
                static export runs with images.unoptimized, so next/image buys
                nothing here. */}
            <img
              className="logo__mark"
              src="/images/brand/iso-logo.png"
              alt=""
              width={606}
              height={359}
            />
            <span className="logo__text">
              <span className="logo__name">{SITE.name}</span>
              <span className="logo__tag">{SITE.tagline}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                className="nav__link"
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <Link className="basket-btn" href="/enquiry">
              <BasketIcon size={18} />
              <span className="basket-btn__label">Enquiry</span>
              {/* Rendered only after localStorage is read, so the server HTML
                  and the first client render match. */}
              {ready && count > 0 && (
                <span className="basket-btn__count">
                  {count}
                  <span className="sr-only"> items in your enquiry list</span>
                </span>
              )}
            </Link>

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-nav container" id="mobile-nav" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                className="mobile-nav__link"
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
