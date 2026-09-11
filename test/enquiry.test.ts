import assert from 'node:assert';
import { existsSync, statSync } from 'node:fs';
import { CATEGORIES, getCategory } from '../src/lib/categories';
import {
  PRODUCTS,
  getProduct,
  productsInCategory,
  searchProducts,
  featuredProducts,
  HERO_IMAGES,
  HERO_PRODUCT_SLUGS,
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
  buildCustomerBody,
  buildCustomerSubject,
  quickWhatsAppUrl,
} from '../src/lib/enquiry';
import { PROJECTS } from '../src/lib/services';
import { canonicalRedirect } from '../worker/index';
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

check('26 products in the catalogue', () => assert.equal(PRODUCTS.length, 26));
check('15 categories defined', () => assert.equal(CATEGORIES.length, 15));

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
  // Compared against PRODUCTS.length rather than a literal: this test is
  // about "everything", not about a particular catalogue size. The two
  // counts above are deliberately literal — they exist to fail loudly when
  // the catalogue changes, which is how the Invisible Grill addition got
  // noticed.
  assert.equal(searchProducts('   ').length, PRODUCTS.length);
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

check('an empty basket with no message is rejected', () => {
  // Superseded the old "empty basket is rejected". The rule is no longer
  // "there must be products" — it is "there must be something to act on",
  // which a written question satisfies. See MESSAGE-ONLY ENQUIRIES below.
  const r = validateEnquiry({ ...goodForm, message: '' }, []);
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

check('every home-page tile override points at a real catalogue image', () => {
  // A typo here is silent and ugly: the tile falls back to the striped
  // "Photograph required" placeholder on the busiest part of the site, and
  // nothing else on the page looks wrong enough to notice.
  const known = new Set(PRODUCTS.flatMap((p) => p.images.map((i) => i.src)));
  for (const [slug, image] of Object.entries(HERO_IMAGES)) {
    assert.ok(
      PRODUCTS.some((p) => p.slug === slug),
      `heroImages has an override for "${slug}", which is not a product`,
    );
    assert.ok(
      HERO_PRODUCT_SLUGS.includes(slug),
      `heroImages overrides "${slug}", which is not one of the four featured products`,
    );
    assert.ok(
      known.has(image.src) || image.src.endsWith('.png'),
      `heroImages "${slug}" points at ${image.src}, which is not in that catalogue`,
    );
    assert.ok(image.alt.length > 15, `heroImages "${slug}" has weak alt text`);
  }
});

check('the list of products still awaiting a photograph is exactly this', () => {
  // Not a failure — a ledger. These products show the striped "Photograph
  // required" placeholder, which is deliberate and visible.
  //
  // It is written out rather than counted so that supplying a photograph
  // means deleting a line here, and so that nobody can quietly point a
  // product at a file that does not exist and have it look the same as a
  // product we are legitimately still waiting on.
  const AWAITING = [
    '/images/products/agri-shade-net-75.jpg',
    '/images/products/birds-protective-nets.jpg',
    '/images/products/blue-pe-tarpaulin.jpg',
    '/images/products/braided-pp-rope.jpg',
    '/images/products/car-parking-shade-mesh.jpg',
    '/images/products/heavy-duty-hdpe-tarpaulin.jpg',
    '/images/products/industrial-monsoon-shed.jpg',
    '/images/products/nylon-hammock-hanging-mesh-net.jpg',
    '/images/products/plastic-bird-spike.jpg',
    '/images/products/privacy-fence-shade.jpg',
    '/images/products/stainless-steel-bird-spike.jpg',
    '/images/products/transparent-bird-net.jpg',
    '/images/products/twisted-pp-safety-rope.jpg',
  ];
  const root = new URL('../public', import.meta.url);
  const missing = PRODUCTS.flatMap((p) => p.images)
    .map((im) => im.src)
    .filter((src) => !existsSync(new URL(`.${src}`, `${root.href}/`)))
    .sort();
  assert.deepEqual(missing, AWAITING);
});

check('every declared hover clip exists on disk', () => {
  // A missing clip fails silently — the hover just does nothing — so nothing
  // else would ever tell us.
  const root = new URL('../public', import.meta.url);
  const missing: string[] = [];
  for (const prod of PRODUCTS) {
    for (const im of prod.images) {
      if (im.video && !existsSync(new URL(`.${im.video}`, `${root.href}/`))) missing.push(im.video);
    }
  }
  assert.deepEqual(missing, []);
});

check('every hover clip is small enough for mobile data', () => {
  // These load on hover, on a connection the visitor is paying for. A clip
  // that creeps past a megabyte stops being an enhancement.
  const root = new URL('../public', import.meta.url);
  const heavy: string[] = [];
  for (const prod of PRODUCTS) {
    for (const im of prod.images) {
      if (!im.video) continue;
      const f = new URL(`.${im.video}`, `${root.href}/`);
      if (!existsSync(f)) continue;
      const kb = statSync(f).size / 1024;
      if (kb > 1024) heavy.push(`${im.video} is ${Math.round(kb)} KB`);
    }
  }
  assert.deepEqual(heavy, [], heavy.join('\n  '));
});

check('no project claims work we cannot evidence', () => {
  // Four invented projects were removed. This stops one drifting back in:
  // every project must point at a photograph that exists.
  const root = new URL('../public', import.meta.url);
  for (const pr of PROJECTS) {
    assert.ok(
      existsSync(new URL(`.${pr.images[0].src}`, `${root.href}/`)),
      `project "${pr.slug}" has no photograph — do not publish a project we cannot show`,
    );
  }
});

check('watermark suppression is only used where it is justified', () => {
  // `watermark: false` hides the corner mark. Every use of it has to be a
  // picture that already carries the company mark in its own pixels — three
  // of the client's posters, and one photograph the old burn-in script
  // stamped before there were clean originals to restore from.
  //
  // This check exists because the flag was once applied to a plain
  // photograph by mistake, and the only symptom was a product quietly
  // shipping with no branding on it at all.
  const JUSTIFIED = new Set([
    '/images/products/invisible-grill.jpg',
    '/images/products/anti-bird-net.jpg',
    '/images/products/premium-artificial-grass-40mm.jpg',
    '/images/products/balcony-anti-fall-net.jpg',
    '/images/projects/indoor-cricket-dome.jpg',
    '/images/projects/multisport-court.jpg',
  ]);
  const suppressed = [...PRODUCTS.flatMap((p) => p.images), ...PROJECTS.flatMap((p) => p.images)]
    .filter((im) => im.watermark === false)
    .map((im) => im.src);
  for (const src of suppressed) {
    assert.ok(JUSTIFIED.has(src), `${src} suppresses the watermark with no reason on record`);
  }
});

console.log('\nMESSAGE-ONLY ENQUIRIES');

// Somebody who has not browsed the catalogue and just wants to ask a
// question. For a trade like this that is a large share of real enquiries,
// and the site used to have no way to send one.
const messageOnly: InquiryForm = { ...goodForm, message: 'Do you do bird netting for a godown in Bhiwandi, roughly 40ft x 60ft?' };

check('an enquiry with no products but a message is accepted', () => {
  const r = validateEnquiry(messageOnly, []);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

check('an enquiry with neither products nor a message is rejected', () => {
  const r = validateEnquiry({ ...goodForm, message: '   ' }, []);
  assert.equal(r.ok, false);
  assert.ok(r.errors.items, 'should point at the empty list / empty message');
});

check('the email subject survives an empty basket', () => {
  // buildEmailSubject read items[0].productName unguarded, so the one
  // enquiry with no product in it threw before it could ever be sent.
  const subject = buildEmailSubject(messageOnly, []);
  assert.ok(subject.includes('General enquiry'), subject);
  assert.ok(subject.includes('Rajesh Kumar'), subject);
});

check('the email body of a message-only enquiry leads with the message', () => {
  const body = buildEmailBody(messageOnly, []);
  assert.ok(body.includes('What they need'), 'message should be the headline, not a footnote');
  assert.ok(body.includes('godown in Bhiwandi'), 'the message itself must be in the body');
  assert.ok(!body.includes('Products required (0)'), 'no empty product heading');
  assert.ok(body.includes('Rajesh Kumar') && body.includes('9876543210'), 'contact details still present');
});

check('the WhatsApp message of a message-only enquiry is complete', () => {
  const wa2 = buildWhatsAppMessage(messageOnly, []);
  assert.ok(wa2.includes('godown in Bhiwandi'));
  assert.ok(!wa2.includes('Products required (0)'));
});

check('a product enquiry still labels the message as additional detail', () => {
  const body = buildEmailBody(goodForm, items);
  assert.ok(body.includes('Additional details'), 'with products the message is a footnote');
  assert.ok(body.includes('Products required (2)'));
});

check('the email route still requires an email address, message or not', () => {
  assert.equal(validateForEmail({ ...messageOnly, email: '' }, []).ok, false);
  assert.equal(validateForEmail(messageOnly, []).ok, true);
});

console.log('\nCUSTOMER CONFIRMATION');

check('the customer copy greets them by first name', () => {
  const body = buildCustomerBody(goodForm, items);
  assert.ok(body.startsWith('Hello Rajesh,'), body.slice(0, 40));
});

check('the customer copy repeats what they sent', () => {
  const body = buildCustomerBody(goodForm, items);
  assert.ok(body.includes('Balcony Anti-Fall Net'));
  assert.ok(body.includes('10ft x 8ft each'), 'their own note must come back to them');
  assert.ok(body.includes('Andheri West, Mumbai'));
  assert.ok(body.includes('12th floor balcony'));
});

check('the customer copy promises nothing the site does not', () => {
  // An automatic message that reads like a commitment is a commitment
  // somebody then has to honour.
  const body = buildCustomerBody(goodForm, items).toLowerCase();
  for (const forbidden of ['quotation attached', 'price', '₹', 'confirmed', 'guarantee', 'in stock']) {
    assert.ok(!body.includes(forbidden), `customer copy should not say "${forbidden}"`);
  }
});

check('the customer copy gives them a way to chase it', () => {
  const body = buildCustomerBody(goodForm, items);
  assert.ok(body.includes('919892612816'), 'phone/WhatsApp must be in the acknowledgement');
});

check('the customer copy works for a message-only enquiry', () => {
  const body = buildCustomerBody(messageOnly, []);
  assert.ok(body.includes('godown in Bhiwandi'));
  assert.ok(!body.includes('Products (0)'), 'no empty product heading');
  assert.ok(buildCustomerSubject([]).includes('your enquiry'));
});

check('the customer subject names the product when there is one', () => {
  assert.ok(buildCustomerSubject([items[0]]).includes('Balcony Anti-Fall Net'));
  assert.ok(buildCustomerSubject(items).includes('2 products'));
});

console.log('\nCANONICAL HOSTNAME');

check('www redirects to the apex', () => {
  assert.equal(
    canonicalRedirect('https://www.speedsafetynet.com/'),
    'https://speedsafetynet.com/',
  );
});

check('the redirect keeps the path and the query', () => {
  // A lazy redirect that drops the path sends someone who followed a link to
  // a specific product onto the home page instead.
  assert.equal(
    canonicalRedirect('https://www.speedsafetynet.com/products/?category=bird-nets'),
    'https://speedsafetynet.com/products/?category=bird-nets',
  );
  assert.equal(
    canonicalRedirect('https://www.speedsafetynet.com/products/cricket-box-net/'),
    'https://speedsafetynet.com/products/cricket-box-net/',
  );
});

check('the apex itself is left alone', () => {
  // Redirecting the canonical host to itself is an infinite loop.
  assert.equal(canonicalRedirect('https://speedsafetynet.com/products/'), null);
});

check('the workers.dev preview is left alone', () => {
  assert.equal(
    canonicalRedirect('https://speedsafetynet-demo.revatiraman199918.workers.dev/'),
    null,
  );
  assert.equal(canonicalRedirect('http://localhost:3000/enquiry/'), null);
});

check('a hostname that merely contains "www" is not touched', () => {
  // "wwwsomething.com" and "shop.www.example.com" must not be rewritten.
  assert.equal(canonicalRedirect('https://wwwspeedsafetynet.com/'), null);
});

console.log(`\n${pass} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}\n`);
