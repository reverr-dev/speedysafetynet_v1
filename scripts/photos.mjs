/**
 * Photo status report.
 *
 *   npm run photos          — what is present, what is missing
 *   npm run photos -- --csv — shot list as CSV, to send to the client
 *
 * Reads the product and project data directly, so it can never drift out of
 * sync with the site. Every filename it prints is exactly what the site will
 * look for.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PRODUCTS_TS = path.join(ROOT, 'src/lib/products.ts');
const SERVICES_TS = path.join(ROOT, 'src/lib/services.ts');
const ACCEPTED = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Pull image entries out of the data files with a regex rather than importing
 * them, so this script needs no TypeScript loader and runs on plain node.
 */
function extract(file, dir) {
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const out = [];

  // img('filename.jpg', 'alt text')  — used in products.ts
  for (const m of src.matchAll(/img\(\s*'([^']+)'\s*,\s*'([^']*)'/g)) {
    out.push({ file: m[1], alt: m[2], dir });
  }
  // { src: '/images/.../file.jpg', alt: '...' }  — used in services.ts
  for (const m of src.matchAll(/src:\s*'\/images\/([^/]+)\/([^']+)'\s*,\s*alt:\s*'([^']*)'/g)) {
    out.push({ file: m[2], alt: m[3], dir: m[1] });
  }
  return out;
}

/** A photo counts as present under any accepted extension. */
function findOnDisk(dir, filename) {
  const stem = filename.replace(/\.[^.]+$/, '');
  for (const ext of ACCEPTED) {
    const candidate = path.join(ROOT, 'public/images', dir, stem + ext);
    if (fs.existsSync(candidate)) return { path: candidate, ext };
  }
  return null;
}

const wanted = [
  ...extract(PRODUCTS_TS, 'products'),
  ...extract(SERVICES_TS, 'projects'),
];

if (wanted.length === 0) {
  console.error('Found no image entries — has the data format changed?');
  process.exit(1);
}

const rows = wanted.map((w) => {
  const found = findOnDisk(w.dir, w.file);
  const sizeKb = found ? Math.round(fs.statSync(found.path).size / 1024) : 0;
  return { ...w, found: Boolean(found), ext: found?.ext ?? '', sizeKb };
});

if (process.argv.includes('--csv')) {
  console.log('Folder,Filename,Photo needed,Status');
  for (const r of rows) {
    const alt = r.alt.replace(/"/g, '""');
    console.log(`${r.dir},${r.file},"${alt}",${r.found ? 'have it' : 'NEEDED'}`);
  }
  process.exit(0);
}

const missing = rows.filter((r) => !r.found);
const present = rows.filter((r) => r.found);
const heavy = present.filter((r) => r.sizeKb > 400);

console.log(`\nPHOTOS  —  ${present.length} of ${rows.length} in place\n`);

if (present.length) {
  console.log('Present:');
  for (const r of present) {
    const warn = r.sizeKb > 400 ? '  ⚠ oversized' : '';
    console.log(`  ✓ ${r.dir}/${r.file.padEnd(42)} ${String(r.sizeKb).padStart(5)} KB${warn}`);
  }
  console.log('');
}

if (missing.length) {
  console.log(`Missing ${missing.length} — the site shows a labelled placeholder for each:`);
  for (const r of missing) console.log(`  ✗ public/images/${r.dir}/${r.file}\n      ${r.alt}`);
  console.log('');
  console.log('Drop correctly-named files into those folders. No code change needed.');
  console.log('Run  npm run photos -- --csv  to send the client a shot list.\n');
}

if (heavy.length) {
  console.log(`⚠ ${heavy.length} photo(s) over 400 KB. On a mobile connection these will`);
  console.log('  hurt load time and Google ranking. Resize to ~1600px wide and re-export.\n');
}

if (!missing.length && !heavy.length) {
  console.log('All photography present and reasonably sized.\n');
}
