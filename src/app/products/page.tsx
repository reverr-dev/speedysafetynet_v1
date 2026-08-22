import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import ProductBrowser from './ProductBrowser';
import CategoryFromUrl from './CategoryFromUrl';

export const metadata: Metadata = {
  title: 'Products — Safety Nets, Bird Nets, Sports Nets & Turf',
  description:
    'Full catalogue of safety nets, bird nets and spikes, shade nets, sports nets, football turf, artificial grass, tarpaulin and rope. Supplied and installed across India.',
};

export default function ProductsPage() {
  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span aria-current="page">Products</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Catalogue</span>
            <h1>Products</h1>
            <p className="lead">
              Everything we supply, grouped by what it does. Add items to your enquiry
              list and send the whole requirement in one message.
            </p>
          </div>

          {/* useSearchParams needs a Suspense boundary under static export. */}
          <Suspense fallback={<ProductBrowser />}>
            <CategoryFromUrl />
          </Suspense>
        </div>
      </section>
    </>
  );
}
