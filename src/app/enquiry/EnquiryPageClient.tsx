'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useEnquiry } from '@/components/EnquiryStore';
import { PROJECT_TYPES, SITE } from '@/lib/site';
import {
  buildEmailPayload,
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
 * Web3Forms is used because it needs no server, no account key in the client
 * beyond a public access key, and its free tier covers far more than this
 * client's volume. Swap ENDPOINT/ACCESS_KEY for Formspree or a Cloudflare
 * Worker + Resend later without touching anything else in this file.
 *
 * ⚠️ Create the key at web3forms.com with the client's email address and put
 * it here before launch. Until then the email button reports failure honestly
 * rather than pretending to succeed — which is exactly the bug we are fixing.
 */
const EMAIL_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

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

  const update = <K extends keyof InquiryForm>(key: K, value: InquiryForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const guard = (result: ValidationResult): boolean => {
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
    if (isSpam(form)) {
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

  const sendWhatsApp = () => {
    if (!guard(validateEnquiry(form, items))) return;
    const url = buildWhatsAppUrl(form, items);
    markSubmitted();
    // Opened before any state change so the browser still treats it as a
    // direct result of the click and does not block the popup.
    window.open(url, '_blank', 'noopener,noreferrer');
    setState('sent-whatsapp');
    clear();
  };

  const sendEmail = async () => {
    if (!guard(validateForEmail(form, items))) return;

    if (!WEB3FORMS_ACCESS_KEY) {
      setFailMessage(
        'Email sending is not configured yet. Please use the WhatsApp button, or call us directly.',
      );
      setState('failed');
      return;
    }

    setState('sending');
    const payload = buildEmailPayload(form, items);

    try {
      const res = await fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: payload.subject,
          from_name: `${SITE.name} website`,
          replyto: payload.replyTo ?? '',
          message: payload.body,
          ...payload.meta,
        }),
      });

      if (!res.ok) throw new Error(`Mail service returned ${res.status}`);

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
            background: 'var(--green-100)',
            color: 'var(--green-800)',
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

  // ── Empty basket ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="empty">
        <h2 style={{ marginBottom: 'var(--space-3)' }}>Your enquiry list is empty</h2>
        <p style={{ marginBottom: 'var(--space-6)' }}>
          Add the products you need a quotation for, then send the whole list in one
          message.
        </p>
        <Link className="btn btn--primary btn--lg" href="/products">
          Browse the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="enquiry-layout">
      {/* ── Items ── */}
      <div>
        <div className="results-bar">
          <span>
            <strong>{items.length}</strong> {items.length === 1 ? 'product' : 'products'} in
            your list
          </span>
          <button
            className="btn btn--outline"
            style={{ padding: '6px 14px', minHeight: 36, fontSize: 'var(--text-sm)' }}
            onClick={clear}
          >
            Clear all
          </button>
        </div>

        <div className="grid" style={{ gap: 'var(--space-3)' }}>
          {items.map((item) => (
            <div className="basket-item" key={item.productId}>
              <div className="basket-item__media">
                <div className="card__placeholder">
                  <span style={{ fontSize: '0.6rem' }}>Photo</span>
                </div>
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
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="panel panel--sticky">
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>
          Your details
        </h2>

        {state === 'failed' && (
          <div className="alert alert--error" role="alert">
            <span>{failMessage}</span>
          </div>
        )}
        {errors.items && (
          <div className="alert alert--error" role="alert">
            <span>{errors.items}</span>
          </div>
        )}

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

        <div className="field">
          <label className="field__label" htmlFor="message">
            Anything else
          </label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Height, access, timeline, or anything else we should know."
          />
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
