"use client";

import Link from "next/link";
import { useCartStore, cartItemCount } from "@/store/cart";
import { SearchIcon, BagIcon } from "@/components/icons";
import { MobileMenu, type MenuCategory } from "@/components/MobileMenu";

export function Header({ categories }: { categories: MenuCategory[] }) {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <MobileMenu categories={categories} />

        <Link
          href="/"
          className="font-serif text-xl italic tracking-tight text-espresso sm:text-2xl"
        >
          Carcamana&apos;s
        </Link>

        <nav className="hidden items-center gap-5 sm:flex">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/?categoria=${c.slug}`}
              className="text-sm font-medium text-espresso-soft transition hover:text-rust"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form action="/" method="GET" className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-soft" />
          <input
            type="search"
            name="q"
            placeholder="Buscar peças"
            className="w-full rounded-full border border-line bg-cream-dark/60 py-2 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso-soft/70 focus:border-rust focus:outline-none"
          />
        </form>

        <Link
          href="/carrinho"
          aria-label="Carrinho"
          className="relative ml-auto text-espresso transition hover:text-rust sm:ml-0"
        >
          <BagIcon className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-semibold text-cream">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
