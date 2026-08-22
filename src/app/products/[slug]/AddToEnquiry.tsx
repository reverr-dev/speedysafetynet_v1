'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useEnquiry } from '@/components/EnquiryStore';
import { quickWhatsAppUrl } from '@/lib/enquiry';
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from '@/components/Icons';

/**
 * Add-to-enquiry panel on the product detail page.
 *
 * Quantity and a free-text requirement are captured here rather than on the
 * enquiry page, because this is the moment the visitor is actually looking at
 * the product and knows the dimensions they need.
 */
export default function AddToEnquiry({ product }: { product: Product }) {
  const { add, has } = useEnquiry();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product, quantity, note);
    setAdded(true);
  };

  if (added) {
    return (
      <div className="panel">
        <div className="alert alert--success">
          <CheckIcon size={18} />
          <span>
            <strong>{product.name}</strong> added to your enquiry list.
          </span>
        </div>
        <Link className="btn btn--primary btn--block" href="/enquiry">
          Review &amp; send enquiry
          <ArrowRightIcon size={16} />
        </Link>
        <Link
          className="btn btn--outline btn--block"
          href="/products"
          style={{ marginTop: 'var(--space-3)' }}
        >
          Continue browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
        Request a quotation
      </h2>

      <div className="field">
        <label className="field__label" htmlFor="qty">
          Quantity
        </label>
        <div className="qty">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="qty"
            className="qty__value"
            style={{ border: 'none', minHeight: 38, padding: 0, textAlign: 'center' }}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="note">
          Your requirement
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. 40ft x 20ft, 3rd floor balcony, needs fitting before the monsoon"
          maxLength={500}
        />
        <span className="field__hint">
          Dimensions and site details help us quote accurately the first time.
        </span>
      </div>

      <button className="btn btn--primary btn--block btn--lg" onClick={handleAdd}>
        {has(product.id) ? 'Add again to enquiry' : 'Add to enquiry'}
      </button>

      <a
        className="btn btn--whatsapp btn--block"
        style={{ marginTop: 'var(--space-3)' }}
        href={quickWhatsAppUrl(product.name)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon size={18} />
        Ask about this on WhatsApp
      </a>
    </div>
  );
}
