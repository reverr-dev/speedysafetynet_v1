import assert from 'node:assert';
import { CATEGORIES, getCategory } from '../src/lib/categories';
import {
  PRODUCTS,
  getProduct,
  productsInCategory,
  searchProducts,
  featuredProducts,
} from '../src/lib/products';
import {
  validateEnquiry,
  validateForEmail,
  isSpam,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  buildEmailBody,
  buildEmailSubject,
  buildEmailPayload,
  quickWhatsAppUrl,
} from '../src/lib/enquiry';
import { PROJECTS } from '../src/lib/services';
import type { InquiryForm, InquiryItem } from '../src/lib/types';

let pass = 0;
const check = (name: string, fn: () => void) => {
  try {
    fn();
    pass++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    console.error(`  FAIL ${name}\n       ${(e as Error).message}`);
    process.exitCode = 1;
  }
};

console.log('\nDATA INTEGRITY');

check('25 products ported', () => assert.equal(PRODUCTS.length, 25));
check('14 categories defined', () => assert.equal(CATEGORIES.length, 14));

check('every product slug is unique', () => {
  const slugs = PRODUCTS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug found');
});

check('every product id is unique', () => {
  const ids = PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id found');
});

check('every category slug is unique', () => {
  const slugs = CATEGORIES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

check('every product points at a real category', () => {
  for (const p of PRODUCTS) {
    assert.ok(getCategory(p.categorySlug), `${p.slug} -> unknown category "${p.categorySlug}"`);
  }
});

check('no category is left empty', () => {
  for (const c of CATEGORIES) {
    // Accessories is intentionally empty until the client supplies the list.
    if (c.slug === 'accessories') continue;
    assert.ok(productsInCategory(c.slug).length > 0, `category "${c.slug}" has no products`);
  }
});

check('slugs are URL-safe', () => {
  const safe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const p of PRODUCTS) assert.ok(safe.test(p.slug), `bad slug: ${p.slug}`);
  for (const c of CATEGORIES) assert.ok(safe.test(c.slug), `bad slug: ${c.slug}`);
});

check('every product has an image with alt text', () => {
  for (const p of PRODUCTS) {
    assert.ok(p.images.length > 0, `${p.slug} has no image`);
    assert.ok(p.images[0].alt.length > 10, `${p.slug} has weak alt text`);
  }
});

check('no picsum placeholders survived the port', () => {
  const bad = PRODUCTS.filter((p) => p.images.some((i) => i.src.includes('picsum')));
  assert.equal(bad.length, 0);
});

check('lookups resolve', () => {
  assert.equal(getProduct('balcony-anti-fall-net')?.name, 'Balcony Anti-Fall Net');
  assert.equal(getProduct('does-not-exist'), undefined);
  assert.equal(productsInCategory('safety-nets').length, 3);
});

check('featured products exist for the home page', () => {
  assert.ok(featuredProducts().length >= 4);
});

check('search finds by application, not just name', () => {
  // "kids" appears only in the applications of the balcony net.
  const r = searchProducts('child safety');
  assert.ok(r.some((p) => p.slug === 'balcony-anti-fall-net'), 'application search failed');
});

check('empty search returns everything', () => {
  assert.equal(searchProducts('   ').length, 25);
});

console.log('\nENQUIRY VALIDATION');

const goodForm: InquiryForm = {
  name: 'Rajesh Kumar',
  phone: '9876543210',
  email: 'rajesh@example.com',
  projectType: 'Residential',
  location: 'Andheri West, Mumbai',
  message: 'Need this fitted on the 12th floor balcony.',
};

const items: InquiryItem[] = [
  {
    productId: 'sn-002',
    productName: 'Balcony Anti-Fall Net',
    categoryName: 'Safety Nets',
    quantity: 2,
    note: '10ft x 8ft each',
  },
  {
    productId: 'bn-001',
    productName: 'Anti Bird Net',
    categoryName: 'Bird Nets',
    quantity: 1,
    note: '',
  },
];

check('a valid enquiry passes', () => {
  assert.equal(validateEnquiry(goodForm, items).ok, true);
});

check('empty basket is rejected', () => {
  const r = validateEnquiry(goodForm, []);
  assert.equal(r.ok, false);
  assert.ok(r.errors.items);
});

check('missing name is rejected', () => {
  assert.equal(validateEnquiry({ ...goodForm, name: '  ' }, items).ok, false);
});

check('missing location is rejected', () => {
  assert.equal(validateEnquiry({ ...goodForm, location: '' }, items).ok, false);
});

check('accepts Indian mobile formats', () => {
  for (const phone of ['9876543210', '+919876543210', '09876543210', '+91 9876543210', '98765-43210']) {
    assert.equal(validateEnquiry({ ...goodForm, phone }, items).ok, true, `rejected: ${phone}`);
  }
});

check('rejects bad phone numbers', () => {
  for (const phone of ['123', '1234567890', '98765', 'abcdefghij', '']) {
    assert.equal(validateEnquiry({ ...goodForm, phone }, items).ok, false, `accepted: ${phone}`);
  }
});

check('email optional for WhatsApp route, required for email route', () => {
  const noEmail = { ...goodForm, email: '' };
  assert.equal(validateEnquiry(noEmail, items).ok, true, 'WhatsApp route should allow no email');
  assert.equal(validateForEmail(noEmail, items).ok, false, 'email route must require email');
});

check('rejects malformed email when supplied', () => {
  assert.equal(validateEnquiry({ ...goodForm, email: 'not-an-email' }, items).ok, false);
});

check('honeypot catches bots', () => {
  assert.equal(isSpam(goodForm), false);
  assert.equal(isSpam({ ...goodForm, company: 'Acme SEO Ltd' }), true);
});

console.log('\nMESSAGE BUILDING');

const wa = buildWhatsAppMessage(goodForm, items);

check('WhatsApp message contains every field', () => {
  for (const needle of [
    'Rajesh Kumar',
    '9876543210',
    'Residential',
    'Andheri West, Mumbai',
    'Balcony Anti-Fall Net',
    'Anti Bird Net',
    'Quantity: 2',
    '10ft x 8ft each',
    '12th floor balcony',
  ]) {
    assert.ok(wa.includes(needle), `missing from WhatsApp message: ${needle}`);
  }
});

check('WhatsApp message omits the empty note cleanly', () => {
  // The bird net has no note — there must be no dangling "Requirement:" label.
  assert.equal((wa.match(/Requirement:/g) ?? []).length, 1);
});

check('WhatsApp URL is a valid, fully-encoded wa.me link', () => {
  const url = buildWhatsAppUrl(goodForm, items);
  assert.ok(url.startsWith('https://wa.me/919892612816?text='));
  // Nothing that would break the URL may survive unencoded.
  const query = url.split('?text=')[1];
  assert.ok(!query.includes(' '), 'unencoded space in URL');
  assert.ok(!query.includes('\n'), 'unencoded newline in URL');
  assert.ok(!query.includes('#'), 'unencoded hash in URL');
  // And it must round-trip back to the original message.
  assert.equal(decodeURIComponent(query), wa);
});

check('quick WhatsApp link works with and without context', () => {
  assert.ok(quickWhatsAppUrl().startsWith('https://wa.me/'));
  assert.ok(decodeURIComponent(quickWhatsAppUrl('bird netting')).includes('bird netting'));
});

check('email subject summarises multiple items', () => {
  const s = buildEmailSubject(goodForm, items);
  assert.ok(s.includes('Balcony Anti-Fall Net'));
  assert.ok(s.includes('+1 more'));
  assert.ok(s.includes('Rajesh Kumar'));
});

check('email subject reads naturally for a single item', () => {
  const s = buildEmailSubject(goodForm, [items[0]]);
  assert.ok(!s.includes('more'), `single-item subject should not say "more": ${s}`);
});

check('email body carries the full enquiry', () => {
  const body = buildEmailBody(goodForm, items);
  for (const needle of ['Rajesh Kumar', '9876543210', 'rajesh@example.com', 'Balcony Anti-Fall Net', 'IST']) {
    assert.ok(body.includes(needle), `missing from email body: ${needle}`);
  }
});

check('email body handles a missing email address', () => {
  const body = buildEmailBody({ ...goodForm, email: '' }, items);
  assert.ok(body.includes('(not provided)'));
});

check('email payload sets reply-to so the client can just hit reply', () => {
  const p = buildEmailPayload(goodForm, items);
  assert.equal(p.replyTo, 'rajesh@example.com');
  assert.equal(p.to, 'speedsafetynet@gmail.com');
  assert.equal(p.meta.itemCount, 2);
});

check('email payload omits reply-to when no email given', () => {
  assert.equal(buildEmailPayload({ ...goodForm, email: '' }, items).replyTo, undefined);
});


console.log('\nIMAGE CONVENTION');

/*
 * The site finds photographs purely by filename: <slug>.jpg. That is what
 * lets someone publish a photo by copying a file into a folder, with no code
 * change. These checks defend that contract — rename a product without
 * renaming its file and the photo silently disappears behind a placeholder,
 * which is the kind of bug nobody notices until the client does.
 */

check('every product image is named after its slug', () => {
  for (const p of PRODUCTS) {
    const expected = `/images/products/${p.slug}.jpg`;
    assert.equal(
      p.images[0].src,
      expected,
      `${p.slug}: first image should be ${expected}, found ${p.images[0].src}`,
    );
  }
});

check('every project image is named after its slug', () => {
  for (const pr of PROJECTS) {
    const expected = `/images/projects/${pr.slug}.jpg`;
    assert.equal(
      pr.images[0].src,
      expected,
      `${pr.slug}: first image should be ${expected}, found ${pr.images[0].src}`,
    );
  }
});

check('extra product images use the -2, -3 suffix convention', () => {
  for (const p of PRODUCTS) {
    p.images.slice(1).forEach((img, i) => {
      const expected = `/images/products/${p.slug}-${i + 2}.jpg`;
      assert.equal(img.src, expected, `${p.slug}: extra image should be ${expected}`);
    });
  }
});

check('every project has alt text worth indexing', () => {
  for (const pr of PROJECTS) {
    assert.ok(pr.images[0].alt.length > 15, `${pr.slug} has weak alt text`);
  }
});

console.log(`\n${pass} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}\n`);
