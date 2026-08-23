"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, item.maxStock);
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: nextQty } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "brecho-cart" }
  )
);

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
