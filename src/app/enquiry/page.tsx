import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryPageClient from './EnquiryPageClient';

export const metadata: Metadata = {
  title: 'Send an Enquiry',
  description:
    'Send your product requirement to Speed Safety Nets by WhatsApp or email and receive a quotation within one business day.',
  robots: { index: false, follow: true },
};

export default function EnquiryPage() {
  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span aria-current="page">Enquiry</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Request a quotation</span>
            <h1>Your enquiry list</h1>
            <p className="lead">
              Check your products, add your details, then send the whole enquiry by
              WhatsApp or email — whichever you prefer.
            </p>
          </div>

          <EnquiryPageClient />
        </div>
      </section>
    </>
  );
}
