/**
 * The enquiry endpoint.
 *
 * One Worker serves the whole site: static files for every normal request,
 * and POST /api/enquiry for the form. Same origin, one deploy, no CORS.
 *
 * WHY A WORKER AT ALL, WHEN THE SITE IS STATIC
 *
 * Because the Resend API key must never reach a browser. A static site ships
 * its JavaScript to everyone who visits, so a key placed there is a key
 * published — and a published key lets anyone on the internet send email as
 * speedsafetynet.com. That is not a leak of the client's data; it is a leak
 * of his reputation, and it ends with his domain on a blocklist.
 *
 * The key lives as a Worker secret. It exists only inside this file's
 * runtime, never in the repository and never in the bundle. The browser posts
 * the enquiry here; this code adds the key and calls Resend.
 *
 * WHAT IS VALIDATED HERE, AND WHY AGAIN
 *
 * The form already validates. That validation is a courtesy to the person
 * filling it in — it is not protection, because anyone can POST to this
 * endpoint directly with curl and never load the page at all. So every rule
 * is enforced again here.
 *
 * They are literally the same functions, imported from src/lib/enquiry.ts.
 * Not a re-implementation: a second copy of these rules would drift from the
 * first, and the day it drifted the form would accept something the server
 * rejected, or worse, the other way round.
 */

import {
  validateForEmail,
  isSpam,
  buildEmailBody,
  buildEmailSubject,
  buildCustomerBody,
  buildCustomerSubject,
} from '../src/lib/enquiry';
import { SITE } from '../src/lib/site';
import type { InquiryForm, InquiryItem } from '../src/lib/types';

export interface Env {
  ASSETS: Fetcher;
  /** Secret. `wrangler secret put RESEND_API_KEY` — never in this repo. */
  RESEND_API_KEY?: string;
  /** e.g. "Speed Safety Nets <enquiries@speedsafetynet.com>" */
  ENQUIRY_FROM?: string;
  /** Where enquiries land. Defaults to the address in src/lib/site.ts. */
  ENQUIRY_TO?: string;
  /** Optional. Without it the per-address throttle below is skipped. */
  RATE_LIMIT?: KVNamespace;
}

/** A form with 40 line items is not a customer. */
const MAX_ITEMS = 40;
/** Generous for a real enquiry, small enough that nobody posts a novel. */
const MAX_BODY_BYTES = 24_000;
/** One enquiry per address per this long. */
const THROTTLE_SECONDS = 60;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

/**
 * Accepted, and nothing was sent.
 *
 * Returned to bots and to anything that trips the throttle. Telling a spammer
 * which rule caught them is telling them how to get past it, and a bot that
 * sees success stops retrying — which is the outcome we want.
 */
const quietlyAccepted = () => json(200, { ok: true });

/**
 * One canonical hostname, and www redirects to it.
 *
 * Serving the same pages at both speedsafetynet.com and www.speedsafetynet.com
 * is the default if you simply point both at the Worker, and it is a quiet
 * mistake. Google treats them as two sites competing with each other, so the
 * links and the ranking a small local business slowly earns get split across
 * two addresses instead of adding up on one. The enquiry basket is worse: it
 * lives in localStorage, which is per-origin, so a visitor who browses on www
 * and then lands on the apex finds their list empty.
 *
 * The apex is canonical because that is what SITE.url says and what is on his
 * visiting card. 301 rather than 302: permanent is the truth, and it is the
 * only one search engines transfer ranking through.
 *
 * Returns null when there is nothing to do.
 */
export function canonicalRedirect(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  if (!url.hostname.startsWith('www.')) return null;
  url.hostname = url.hostname.slice(4);
  // Path and query are carried over, so a shared link to a product page still
  // lands on that product page rather than dumping the visitor on the home
  // page — which is the thing that makes lazy redirects infuriating.
  return url.toString();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const canonical = canonicalRedirect(request.url);
    if (canonical) return Response.redirect(canonical, 301);

    const url = new URL(request.url);

    if (url.pathname !== '/api/enquiry') {
      // Everything else is the website.
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return json(405, { ok: false, error: 'Method not allowed' });
    }

    // Same-origin only. This endpoint exists for one form on one site; a POST
    // arriving from anywhere else is not a customer.
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) {
      return json(403, { ok: false, error: 'Forbidden' });
    }

    if (!env.RESEND_API_KEY) {
      // Deliberately loud. A misconfigured endpoint that answered "ok" would
      // send every enquiry into a hole, and nobody would notice until the
      // client asked why the website never produces any work.
      console.error('RESEND_API_KEY is not set — enquiry not sent');
      return json(503, { ok: false, error: 'Email is not configured' });
    }

    let payload: { form?: InquiryForm; items?: InquiryItem[] };
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'Too large' });
      payload = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: 'Malformed request' });
    }

    const form = payload.form;
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!form || typeof form !== 'object') {
      return json(400, { ok: false, error: 'Malformed request' });
    }
    // No lower bound. An enquiry with no products is a valid enquiry — the
    // visitor who has not browsed and just wants to ask a question. That the
    // message must then be non-empty is validateForEmail's job, below, and
    // it is the same rule the form applies.
    if (items.length > MAX_ITEMS) {
      return json(400, { ok: false, error: 'Enquiry list is too long' });
    }

    // The honeypot. A human never sees this field; a bot fills everything.
    if (isSpam(form)) return quietlyAccepted();

    const check = validateForEmail(form, items);
    if (!check.ok) {
      // Field-level errors are safe to return: the visitor typed them, and
      // the form needs to know which box to mark.
      return json(422, { ok: false, errors: check.errors });
    }

    // Throttle on the email address rather than the IP. A whole office, or a
    // whole mobile network, can share one IP — throttling that turns one
    // spammer into a blocked neighbourhood.
    const throttleKey = `enq:${form.email.trim().toLowerCase()}`;
    if (env.RATE_LIMIT) {
      if (await env.RATE_LIMIT.get(throttleKey)) return quietlyAccepted();
      // Written before sending, not after: two requests arriving together
      // would both pass a check that only closed once the first had finished.
      ctx.waitUntil(
        env.RATE_LIMIT.put(throttleKey, '1', { expirationTtl: THROTTLE_SECONDS }),
      );
    }

    const from = env.ENQUIRY_FROM ?? `${SITE.name} <enquiries@speedsafetynet.com>`;
    const to = env.ENQUIRY_TO ?? SITE.contact.email;
    // Already validated as a well-formed address by validateForEmail above.
    const customerEmail = form.email.trim();

    const send = (body: Record<string, unknown>) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

    // ── 1. The enquiry, to the business ──────────────────────────────────
    //
    // Awaited, and the only one that decides what the visitor is told. If
    // this fails the enquiry did not arrive, and they need to know that so
    // they try WhatsApp instead of waiting for a reply that is not coming.
    const res = await send({
      from,
      to: [to],
      subject: buildEmailSubject(form, items),
      text: buildEmailBody(form, items),
      // The whole point. He opens the mail in Gmail, hits Reply, and it goes
      // to the customer — not to us, and not to a no-reply address.
      //
      // The From stays the verified domain. Putting the customer's own
      // address there would fail SPF and DMARC and land the enquiry in spam,
      // which is the failure nobody ever finds out about.
      reply_to: customerEmail,
    });

    if (!res.ok) {
      // Resend's message can name the account and the domain. Log it where we
      // can read it; tell the visitor only that it did not work.
      console.error('Resend rejected the enquiry', res.status, await res.text());
      return json(502, { ok: false, error: 'Could not send' });
    }

    // ── 2. The acknowledgement, to the customer ──────────────────────────
    //
    // NOT awaited, and its failure is not the visitor's problem. The enquiry
    // is already with the business at this point; if the courtesy copy
    // bounces — a typo'd address, a full mailbox, a strict corporate filter —
    // telling the sender their enquiry failed would be a lie, and it would
    // push them to send it again.
    //
    // waitUntil keeps the Worker alive to finish this after the response has
    // gone, so the visitor does not wait on it either.
    ctx.waitUntil(
      send({
        from,
        to: [customerEmail],
        subject: buildCustomerSubject(items),
        text: buildCustomerBody(form, items),
        // Reply-To is the business, so a customer who answers this reaches a
        // person rather than an unread automated address.
        reply_to: to,
      })
        .then(async (r) => {
          if (!r.ok) console.error('Customer copy failed', r.status, await r.text());
        })
        .catch((e) => console.error('Customer copy threw', e)),
    );

    return json(200, { ok: true });
  },
};
