"use client";

import Link from "next/link";
import { useCartStore, cartItemCount } from "@/store/cart";
import { SearchIcon, BagIcon } from "@/components/icons";
import { MobileMenu, type MenuCategory } from "@/components/MobileMenu";

export function Header({ categories }: { categories: MenuCategory[] }) {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <MobileMenu categories={categories} />

        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Brechó Online
        </Link>

        <nav className="hidden items-center gap-5 sm:flex">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/?categoria=${c.slug}`}
              className="text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form action="/" method="GET" className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            name="q"
            placeholder="Buscar peças"
            className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
          />
        </form>

        <Link
          href="/carrinho"
          aria-label="Carrinho"
          className="relative ml-auto text-stone-700 hover:text-stone-900 sm:ml-0"
        >
          <BagIcon className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-semibold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
