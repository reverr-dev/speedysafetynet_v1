'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { InquiryItem, Product } from '@/lib/types';
import { getCategory } from '@/lib/categories';

/**
 * The enquiry basket.
 *
 * Persisted to localStorage so a visitor who browses the catalogue, closes the
 * tab and comes back later still has their selection. Losing it is the fastest
 * way to lose the enquiry.
 */

const STORAGE_KEY = 'ssn_enquiry_v1';
const MAX_ITEMS = 30;

interface EnquiryContextValue {
  items: InquiryItem[];
  count: number;
  /** False until localStorage has been read — prevents a hydration mismatch. */
  ready: boolean;
  has: (productId: string) => boolean;
  add: (product: Product, quantity?: number, note?: string) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setNote: (productId: string, note: string) => void;
  clear: () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

function isValidItem(v: unknown): v is InquiryItem {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === 'string' &&
    typeof o.productName === 'string' &&
    typeof o.categoryName === 'string' &&
    typeof o.quantity === 'number' &&
    typeof o.note === 'string'
  );
}

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on mount. Server-rendered HTML has an empty basket, so reading
  // during render would cause a hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // Validate rather than trust — localStorage is user-editable, and a
        // malformed entry would otherwise crash every page that renders it.
        if (Array.isArray(parsed)) setItems(parsed.filter(isValidItem).slice(0, MAX_ITEMS));
      }
    } catch {
      // Corrupt or unavailable storage (private mode) — start empty.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota exceeded or storage disabled — the basket still works in memory.
    }
  }, [items, ready]);

  const add = useCallback((product: Product, quantity = 1, note = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
            : i,
        );
      }
      if (prev.length >= MAX_ITEMS) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          categoryName: getCategory(product.categorySlug)?.name ?? '',
          quantity: Math.max(1, quantity),
          note,
        },
      ];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(1, Math.min(9999, Math.floor(quantity) || 1));
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)));
  }, []);

  const setNote = useCallback((productId: string, note: string) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, note: note.slice(0, 500) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<EnquiryContextValue>(
    () => ({
      items,
      count: items.length,
      ready,
      has: (id) => items.some((i) => i.productId === id),
      add,
      remove,
      setQuantity,
      setNote,
      clear,
    }),
    [items, ready, add, remove, setQuantity, setNote, clear],
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry(): EnquiryContextValue {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used inside <EnquiryProvider>');
  return ctx;
}
