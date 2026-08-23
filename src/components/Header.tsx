"use client";

import Link from "next/link";
import { useCartStore, cartItemCount } from "@/store/cart";

export function Header() {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Brechó Online
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
            Peças
          </Link>
          <Link
            href="/carrinho"
            className="relative text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Carrinho
            {count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
