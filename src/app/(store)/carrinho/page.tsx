"use client";

import Link from "next/link";
import { useCartStore, cartTotalCents } from "@/store/cart";
import { formatCentsToBRL } from "@/lib/money";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = cartTotalCents(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-stone-600">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Ver peças disponíveis
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold text-stone-900">Seu carrinho</h1>

      <ul className="divide-y divide-stone-200 border-y border-stone-200">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-stone-100">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/produto/${item.slug}`} className="truncate text-sm font-medium text-stone-900 hover:underline">
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-stone-500">{formatCentsToBRL(item.priceCents)}</p>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  className="rounded-md border border-stone-300 px-2 py-1 text-sm"
                >
                  {Array.from({ length: item.maxStock }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-stone-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-stone-900">
              {formatCentsToBRL(item.priceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-600">Total</p>
        <p className="text-xl font-semibold text-stone-900">{formatCentsToBRL(total)}</p>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-md bg-stone-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-stone-700"
      >
        Finalizar compra
      </Link>
    </div>
  );
}
