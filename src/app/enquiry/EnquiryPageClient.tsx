'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useEnquiry } from '@/components/EnquiryStore';
import { PROJECT_TYPES } from '@/lib/site';
import { getProductById } from '@/lib/products';
import ProductImage from '@/components/ProductImage';
import {
  buildWhatsAppUrl,
  isRateLimited,
  isSpam,
  markSubmitted,
  validateEnquiry,
  validateForEmail,
  type ValidationResult,
} from '@/lib/enquiry';
import type { InquiryForm } from '@/lib/types';
import { CheckIcon, MailIcon, TrashIcon, WhatsAppIcon } from '@/components/Icons';

/**
 * Where the email actually goes.
 *
 * Our own endpoint on our own domain — see worker/index.ts. It holds the
 * Resend API key as a Worker secret and sends the mail server-side.
 *
 * A relative path, deliberately. Same origin means no CORS preflight, no
 * third party in the path between a customer and the business, and the same
 * URL working on localhost, on the workers.dev preview and on the live
 * domain, with nothing to configure per environment.
 *
 * This replaced a Web3Forms placeholder that was never wired up. There is no
 * public key here any more because there is nothing public to hold.
 */
const EMAIL_ENDPOINT = '/api/enquiry';

const EMPTY_FORM: InquiryForm = {
  name: '',
  phone: '',
  email: '',
  projectType: PROJECT_TYPES[0],
  location: '',
  message: '',
  company: '',
};

type SendState = 'idle' | 'sending' | 'sent-whatsapp' | 'sent-email' | 'failed';

export default function EnquiryPageClient() {
  const { items, ready, remove, setQuantity, setNote, clear } = useEnquiry();
  const [form, setForm] = useState<InquiryForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [state, setState] = useState<SendState>('idle');
  const [failMessage, setFailMessage] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Read what is actually in the boxes, not what React thinks is in them.
   *
   * These are controlled inputs, so normally state and DOM agree. Browser
   * autofill breaks that. Firefox in particular fills a saved name and phone
   * number by writing straight to the element, and React never sees an event:
   * the box shows +918169317644, `form.phone` is still '', and the visitor is
   * told "Please enter your phone number" while looking at their phone number.
   *
   * That is the worst kind of bug on a contact form. It only hits people whose
   * browser has their details saved — which is most returning customers — it
   * looks like the site is broken, and they leave rather than retyping.
   *
   * So before validating anything, the live values win. Cheap, runs once per
   * submit, and it fixes every autofill variant rather than the one we found.
   */
  const readLiveValues = (): InquiryForm => {
    const root = panelRef.current;
    if (!root) return form;
    const read = (id: keyof InquiryForm, fallback: string): string => {
      const el = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        `#${id}`,
      );
      return el ? el.value : fallback;
    };
    return {
      name: read('name', form.name),
      phone: read('phone', form.phone),
      email: read('email', form.email),
      projectType: read('projectType', form.projectType),
      location: read('location', form.location),
      message: read('message', form.message),
      company: read('company', form.company ?? ''),
    };
  };

  const update = <K extends keyof InquiryForm>(key: K, value: InquiryForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const guard = (result: ValidationResult, candidate: InquiryForm = form): boolean => {
    setErrors(result.errors);
    if (!result.ok) {
      // Deferred: setErrors has not re-rendered yet, so .field--error does not
      // exist in the DOM at this instant. Without the timeout this scrolls to
      // the *previous* error, or nowhere at all on the first failed attempt.
      window.setTimeout(() => {
        document
          .querySelector('.field--error, .alert--error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
      return false;
    }
    if (isSpam(candidate)) {
      // Silently accept for the bot, do nothing real.
      setState('sent-whatsapp');
      return false;
    }
    if (isRateLimited()) {
      setFailMessage('You just sent an enquiry. Please wait a moment before sending another.');
      setState('failed');
      return false;
    }
    return true;
  };

  /*
   * Catch up with autofill once the page has settled.
   *
   * Browsers fill saved details at their own pace — sometimes before React
   * hydrates, sometimes a beat after. Anything written before the handlers
   * are attached is invisible to React, and a controlled input whose state
   * says '' while the box shows text is a field that fights the person
   * typing in it.
   *
   * One read shortly after mount reconciles the two, and from that moment it
   * behaves as an ordinary controlled input. The submit-time read stays as
   * well, for autofill chosen from a dropdown much later.
   */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const live = readLiveValues();
      setForm((current) =>
        (Object.keys(live) as (keyof InquiryForm)[]).some((k) => live[k] !== current[k])
          ? live
          : current,
      );
    }, 350);
    return () => window.clearTimeout(id);
    // Once, after mount. readLiveValues only reads the DOM, so it needs no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendWhatsApp = () => {
    const live = readLiveValues();
    setForm(live);
    if (!guard(validateEnquiry(live, items), live)) return;
    const url = buildWhatsAppUrl(live, items);
    markSubmitted();
    // Opened before any state change so the browser still treats it as a
    // direct result of the click and does not block the popup.
    window.open(url, '_blank', 'noopener,noreferrer');
    setState('sent-whatsapp');
    clear();
  };

  const sendEmail = async () => {
    const live = readLiveValues();
    setForm(live);
    if (!guard(validateForEmail(live, items), live)) return;

    setState('sending');

    try {
      // The raw form and basket, not a pre-built message. The Worker
      // re-validates and composes the email itself — anything this browser
      // says about what the email should contain is a suggestion, and a
      // request that never touched this page could suggest anything.
      const res = await fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: live, items }),
      });

      if (res.status === 422) {
        // The server rejected a field the form let through. Show it on the
        // field rather than as a generic failure.
        const body = (await res.json()) as { errors?: ValidationResult['errors'] };
        guard({ ok: false, errors: body.errors ?? {} });
        setState('idle');
        return;
      }

      if (!res.ok) throw new Error(`Enquiry endpoint returned ${res.status}`);

      markSubmitted();
      setState('sent-email');
      clear();
    } catch (err) {
      // Never claim success on failure — the whole point of this rebuild.
      setFailMessage(
        'We could not send your enquiry by email just now. Please try WhatsApp instead, or call us.',
      );
      setState('failed');
      console.error('Enquiry email failed:', err);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────
  if (state === 'sent-whatsapp' || state === 'sent-email') {
    return (
      <div className="panel" style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--brand-100)',
            color: 'var(--brand-800)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto var(--space-5)',
          }}
        >
          <CheckIcon size={30} />
        </div>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>
          {state === 'sent-whatsapp' ? 'Opening WhatsApp…' : 'Enquiry sent'}
        </h1>
        <p className="lead" style={{ margin: '0 auto var(--space-6)' }}>
          {state === 'sent-whatsapp' ? (
            <>
              Your enquiry has been prepared in WhatsApp. <strong>Press send</strong> in
              WhatsApp to deliver it — if the window did not open, check your popup
              blocker.
            </>
          ) : (
            <>
              Thank you. Your enquiry is with our team and we will respond
              {form.email ? ` at ${form.email}` : ''} within one business day.
            </>
          )}
        </p>
        <Link className="btn btn--primary btn--lg" href="/products">
          Continue browsing
        </Link>
      </div>
    );
  }

  if (!ready) {
    return <p className="muted">Loading your enquiry list…</p>;
  }

  /*
   * An empty basket is NOT a dead end.
   *
   * This used to render a "your list is empty" screen with a link back to the
   * catalogue and no way to send anything. That turned away the visitor who
   * has not browsed and just wants to ask a question — "do you do bird
   * netting for a godown in Bhiwandi?" — which for this trade is a large
   * share of real enquiries, and often the better ones.
   *
   * So the form always renders. With no products it is a plain contact form,
   * and the message box carries the enquiry.
   */

  return (
    <div className="enquiry-layout">
      {/* ── Items ── */}
      <div>
        <div className="results-bar">
          <span>
            {items.length === 0 ? (
              'No products added — tell us what you need below'
            ) : (
              <>
                <strong>{items.length}</strong>{' '}
                {items.length === 1 ? 'product' : 'products'} in your list
              </>
            )}
          </span>
          {items.length > 0 ? (
            <button
              className="btn btn--outline"
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 'var(--text-sm)' }}
              onClick={clear}
            >
              Clear all
            </button>
          ) : (
            <Link
              className="btn btn--outline"
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 'var(--text-sm)' }}
              href="/products"
            >
              Browse the catalogue
            </Link>
          )}
        </div>

        <div className="grid" style={{ gap: 'var(--space-3)' }}>
          {items.map((item) => {
            // The basket stores only ids and names — deliberately, so a saved
            // list survives a product being renamed. The photograph is looked
            // up live from the catalogue each render.
            //
            // It can legitimately come back undefined: a basket sitting in
            // localStorage for a month may name a product since removed. That
            // falls through to the placeholder rather than throwing, because
            // losing a thumbnail is a blemish and losing the whole page is an
            // outage.
            const product = getProductById(item.productId);
            const image = product?.images[0];
            return (
            <div className="basket-item" key={item.productId}>
              <div className="basket-item__media">
                {image ? (
                  <ProductImage src={image.src} alt={image.alt} />
                ) : (
                  <div className="card__placeholder">
                    <span style={{ fontSize: '0.6rem' }}>Photo</span>
                  </div>
                )}
              </div>

              <div className="basket-item__body">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)' }}>{item.productName}</h3>
                    <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                      {item.categoryName}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    aria-label={`Remove ${item.productName}`}
                    style={{ color: 'var(--color-text-muted)', height: 32 }}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    margin: 'var(--space-3) 0',
                  }}
                >
                  <span
                    className="muted"
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}
                  >
                    Qty
                  </span>
                  <div className="qty">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty__value">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => setNote(item.productId, e.target.value)}
                  placeholder="Size / requirement for this item"
                  aria-label={`Requirement for ${item.productName}`}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    minHeight: 40,
                  }}
                />
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="panel panel--sticky" ref={panelRef}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>
          Your details
        </h2>

        {state === 'failed' && (
          <div className="alert alert--error" role="alert">
            <span>{failMessage}</span>
          </div>
        )}
        {/* There is deliberately no items error banner here.
            errors.items is only ever set when the basket is empty AND the
            message box is blank, so a banner gated on items.length > 0 could
            never render. The message now lives on the message box itself,
            which is the field the visitor has to act on. */}

        <div className={`field${errors.name ? ' field--error' : ''}`}>
          <label className="field__label" htmlFor="name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            autoComplete="name"
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>

        <div className="field-row">
          <div className={`field${errors.phone ? ' field--error' : ''}`}>
            <label className="field__label" htmlFor="phone">
              Phone <span className="req">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="98765 43210"
              autoComplete="tel"
            />
            {errors.phone && <span className="field__error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="projectType">
              Project type
            </label>
            <select
              id="projectType"
              value={form.projectType}
              onChange={(e) => update('projectType', e.target.value)}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`field${errors.email ? ' field--error' : ''}`}>
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
          {errors.email ? (
            <span className="field__error">{errors.email}</span>
          ) : (
            <span className="field__hint">Only required if you send by email.</span>
          )}
        </div>

        <div className={`field${errors.location ? ' field--error' : ''}`}>
          <label className="field__label" htmlFor="location">
            Site location <span className="req">*</span>
          </label>
          <input
            id="location"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Andheri West, Mumbai"
          />
          {errors.location && <span className="field__error">{errors.location}</span>}
        </div>

        {/* With no products in the list this box IS the enquiry, so it says
            so — and carries the "add a product or write here" error, which
            would otherwise appear next to a basket that is not on screen. */}
        <div className={`field${errors.items ? ' field--error' : ''}`}>
          <label className="field__label" htmlFor="message">
            {items.length === 0 ? 'What do you need?' : 'Anything else'}
          </label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => {
              update('message', e.target.value);
              if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
            }}
            placeholder={
              items.length === 0
                ? 'e.g. Bird netting for a warehouse in Bhiwandi, roughly 40ft x 60ft — what would that cost?'
                : 'Height, access, timeline, or anything else we should know.'
            }
          />
          {errors.items && <span className="field__error">{errors.items}</span>}
        </div>

        {/* Honeypot — invisible to people, filled in by bots. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="company">Company (leave blank)</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={form.company ?? ''}
            onChange={(e) => update('company', e.target.value)}
          />
        </div>

        <div className="send-choice">
          <button
            className="btn btn--whatsapp btn--lg"
            onClick={sendWhatsApp}
            disabled={state === 'sending'}
          >
            <WhatsAppIcon size={20} />
            Send on WhatsApp
          </button>

          <button
            className="btn btn--primary btn--lg"
            onClick={sendEmail}
            disabled={state === 'sending'}
          >
            <MailIcon size={18} />
            {state === 'sending' ? 'Sending…' : 'Send by Email'}
          </button>

          <p className="send-choice__note">
            Choose whichever suits you — the same enquiry is sent either way.
          </p>
        </div>
      </div>
    </div>
  );
}
