import { SITE } from './site';
import type { InquiryForm, InquiryItem } from './types';

/**
 * The enquiry engine.
 *
 * The previous demo's submit handler ran console.log() and then displayed
 * "Inquiry Sent Successfully" — nothing ever reached the business. This module
 * is the real thing: the visitor fills one form, then chooses WhatsApp or
 * email, and the same enquiry is delivered either way.
 */

// ── Validation ───────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof InquiryForm | 'items', string>>;
}

/** Indian mobile numbers: 10 digits starting 6-9, with optional +91 / 0 prefix. */
const INDIAN_MOBILE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(form: InquiryForm, items: InquiryItem[]): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!form.name.trim()) errors.name = 'Please enter your name.';
  else if (form.name.trim().length < 2) errors.name = 'Please enter your full name.';

  const phone = form.phone.replace(/[\s-]/g, '');
  if (!phone) errors.phone = 'Please enter your phone number.';
  else if (!INDIAN_MOBILE.test(phone)) errors.phone = 'Please enter a valid 10-digit mobile number.';

  // Email is optional when sending via WhatsApp, but must be valid if given.
  if (form.email.trim() && !EMAIL.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!form.location.trim()) errors.location = 'Please tell us the site location.';

  // An enquiry is EITHER a list of products OR a written question — the two
  // ways people actually arrive. Somebody who has browsed the catalogue adds
  // items; somebody who has not, and just wants to ask whether we do bird
  // netting for a warehouse, types it. Demanding a product from the second
  // person turns them away at the door, which is the opposite of what an
  // enquiry form is for.
  if (items.length === 0 && !form.message.trim()) {
    errors.items =
      'Add a product to your list, or tell us what you need in the message box below.';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

/** Email is required for the email route specifically. */
export function validateForEmail(form: InquiryForm, items: InquiryItem[]): ValidationResult {
  const result = validateEnquiry(form, items);
  if (!form.email.trim()) {
    result.errors.email = 'An email address is required to send by email.';
    result.ok = false;
  }
  return result;
}

/**
 * Honeypot check. The `company` field is hidden from real users via CSS, so
 * any value in it means an automated submission. Returns true if it's spam.
 */
export function isSpam(form: InquiryForm): boolean {
  return Boolean(form.company && form.company.trim().length > 0);
}

// ── Rate limiting ────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'ssn_last_enquiry_at';
const RATE_LIMIT_MS = 30_000;

/**
 * Client-side throttle so a stuck button or an impatient user cannot fire the
 * same enquiry ten times. The server-side limit is the real protection; this
 * just avoids the obvious case.
 */
export function isRateLimited(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  const last = Number(window.localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
  return now - last < RATE_LIMIT_MS;
}

export function markSubmitted(now: number = Date.now()): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RATE_LIMIT_KEY, String(now));
}

// ── Message formatting ───────────────────────────────────────────────────

function formatItems(items: InquiryItem[]): string[] {
  return items.map((item, i) => {
    const lines = [`${i + 1}. ${item.productName} (${item.categoryName})`, `   Quantity: ${item.quantity}`];
    if (item.note.trim()) lines.push(`   Requirement: ${item.note.trim()}`);
    return lines.join('\n');
  });
}

/**
 * Builds the WhatsApp message body.
 *
 * Kept as plain text with generous line breaks because WhatsApp renders it in
 * a narrow mobile column — tables and long lines become unreadable there.
 */
export function buildWhatsAppMessage(form: InquiryForm, items: InquiryItem[]): string {
  const parts: string[] = [
    `*New Enquiry — ${SITE.name}*`,
    '',
    `*Name:* ${form.name.trim()}`,
    `*Phone:* ${form.phone.trim()}`,
  ];

  if (form.email.trim()) parts.push(`*Email:* ${form.email.trim()}`);
  parts.push(`*Project type:* ${form.projectType}`);
  parts.push(`*Site location:* ${form.location.trim()}`);
  if (items.length > 0) {
    parts.push('', `*Products required (${items.length}):*`, ...formatItems(items));
  }

  if (form.message.trim()) {
    // The heading changes with the context. On a product enquiry this text is
    // a footnote to the list; with no list it IS the enquiry, and labelling
    // it "additional details" makes the only real content look optional.
    parts.push(
      '',
      items.length > 0 ? '*Additional details:*' : '*What they need:*',
      form.message.trim(),
    );
  }

  parts.push('', `_Sent from ${SITE.url}_`);
  return parts.join('\n');
}

/**
 * Builds the wa.me deep link.
 *
 * wa.me is used rather than api.whatsapp.com because it resolves correctly on
 * desktop, Android and iOS without extra handling. The message must be
 * percent-encoded — encodeURIComponent handles the newlines and asterisks.
 */
export function buildWhatsAppUrl(form: InquiryForm, items: InquiryItem[]): string {
  const text = encodeURIComponent(buildWhatsAppMessage(form, items));
  return `https://wa.me/${SITE.contact.whatsappE164}?text=${text}`;
}

/** Plain-text body used for the email route. */
export function buildEmailBody(form: InquiryForm, items: InquiryItem[]): string {
  const parts: string[] = [
    `New enquiry from ${SITE.url}`,
    '',
    '--- Customer ---',
    `Name:          ${form.name.trim()}`,
    `Phone:         ${form.phone.trim()}`,
    `Email:         ${form.email.trim() || '(not provided)'}`,
    `Project type:  ${form.projectType}`,
    `Site location: ${form.location.trim()}`,
    '',
  ];

  if (items.length > 0) {
    parts.push(`--- Products required (${items.length}) ---`, ...formatItems(items));
  }

  if (form.message.trim()) {
    parts.push(
      '',
      items.length > 0 ? '--- Additional details ---' : '--- What they need ---',
      form.message.trim(),
    );
  }

  parts.push(
    '',
    '---',
    `Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
  );

  return parts.join('\n');
}

export function buildEmailSubject(form: InquiryForm, items: InquiryItem[]): string {
  // Reading items[0] unguarded used to throw here the moment somebody sent a
  // message with an empty basket — the one enquiry that has no product in it.
  const first = items[0];
  const summary = !first
    ? 'General enquiry'
    : items.length === 1
      ? first.productName
      : `${first.productName} +${items.length - 1} more`;
  return `Enquiry: ${summary} — ${form.name.trim()} (${form.location.trim()})`;
}

// ── Confirmation back to the customer ────────────────────────────────────

/**
 * The acknowledgement the customer gets.
 *
 * Two things this earns, and they are worth being explicit about because an
 * auto-reply is easy to do badly.
 *
 * It tells them it arrived. A form that swallows an enquiry and says nothing
 * leaves the sender wondering for a day whether to phone instead — and a
 * fair number of them phone a competitor.
 *
 * And it puts a copy in their inbox. When they follow up next week they have
 * their own dimensions and notes in front of them, in writing, rather than
 * half-remembering what they typed.
 *
 * What it deliberately does NOT do: quote a price, confirm availability, or
 * promise anything the business has not already promised on the website. It
 * repeats what they sent and says a person will reply. An automatic message
 * that reads like a commitment is a commitment somebody has to honour.
 */
export function buildCustomerSubject(items: InquiryItem[]): string {
  const what = items.length === 0
    ? 'your enquiry'
    : items.length === 1
      ? `your enquiry about ${items[0].productName}`
      : `your enquiry (${items.length} products)`;
  return `We have received ${what} — ${SITE.name}`;
}

export function buildCustomerBody(form: InquiryForm, items: InquiryItem[]): string {
  const first = form.name.trim().split(/\s+/)[0] || form.name.trim();
  const parts: string[] = [
    `Hello ${first},`,
    '',
    'Thank you for your enquiry. It has reached our team and someone will',
    'reply to you within one business day.',
    '',
    'Here is a copy of what you sent, for your records:',
    '',
  ];

  if (items.length > 0) {
    parts.push(`--- Products (${items.length}) ---`, ...formatItems(items), '');
  }

  if (form.message.trim()) {
    parts.push('--- What you told us ---', form.message.trim(), '');
  }

  parts.push(
    `--- Site location ---`,
    form.location.trim(),
    '',
    'If you need us sooner, call or message us:',
    `  Phone / WhatsApp: +${SITE.contact.phoneE164}`,
    `  Email:            ${SITE.contact.email}`,
    '',
    '---',
    SITE.name,
    SITE.tagline,
    SITE.url,
    '',
    'You are receiving this because an enquiry was submitted with this email',
    `address at ${SITE.url}. If that was not you, you can ignore this message.`,
  );

  return parts.join('\n');
}

/** Payload posted to the email delivery endpoint. */
export interface EmailPayload {
  to: string;
  replyTo?: string;
  subject: string;
  body: string;
  meta: {
    name: string;
    phone: string;
    projectType: string;
    location: string;
    itemCount: number;
    source: string;
  };
}

export function buildEmailPayload(form: InquiryForm, items: InquiryItem[]): EmailPayload {
  return {
    to: SITE.contact.email,
    replyTo: form.email.trim() || undefined,
    subject: buildEmailSubject(form, items),
    body: buildEmailBody(form, items),
    meta: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      projectType: form.projectType,
      location: form.location.trim(),
      itemCount: items.length,
      source: SITE.url,
    },
  };
}

// ── Simple contact links ─────────────────────────────────────────────────

/** Floating WhatsApp button — no form context, just opens a chat. */
export function quickWhatsAppUrl(context?: string): string {
  const text = encodeURIComponent(
    context
      ? `Hello ${SITE.name}, I would like to enquire about ${context}.`
      : `Hello ${SITE.name}, I would like to enquire about your products.`,
  );
  return `https://wa.me/${SITE.contact.whatsappE164}?text=${text}`;
}

export const telLink = (): string => `tel:+${SITE.contact.phoneE164}`;
export const mailtoLink = (): string => `mailto:${SITE.contact.email}`;
