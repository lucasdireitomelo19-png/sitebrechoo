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
        <p className="text-espresso-soft">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
        >
          Ver peças disponíveis
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-extrabold text-2xl text-espresso">Seu carrinho</h1>

      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-cream-dark">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/produto/${item.slug}`}
                className="truncate text-sm font-medium text-espresso transition hover:text-sage"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-espresso-soft">{formatCentsToBRL(item.priceCents)}</p>
              <div className="mt-2 flex items-center gap-3">
                <select
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  className="rounded-md border border-line bg-cream px-2 py-1 text-sm text-espresso transition focus:border-sage focus:outline-none"
                >
                  {Array.from({ length: item.maxStock }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-espresso-soft transition hover:text-sage"
                >
                  Remover
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-espresso">
              {formatCentsToBRL(item.priceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-espresso-soft">Total</p>
        <p className="text-xl font-semibold text-espresso">{formatCentsToBRL(total)}</p>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-espresso px-4 py-3 text-center text-sm font-medium text-cream transition hover:bg-sage"
      >
        Finalizar compra
      </Link>
    </div>
  );
}
