"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCartStore, cartItemCount } from "@/store/cart";
import { SearchIcon, BagIcon, UserIcon } from "@/components/icons";
import { MobileMenu, type MenuCategory } from "@/components/MobileMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n";

export function Header({
  categories,
  t,
  locale,
}: {
  categories: MenuCategory[];
  t: Dictionary;
  locale: Locale;
}) {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <MobileMenu categories={categories} t={t.header} />

        <Link
          href="/"
          className="font-extrabold text-xl tracking-tight text-espresso sm:text-2xl"
        >
          Carcamana&apos;s
        </Link>

        <nav className="hidden items-center gap-5 sm:flex">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/?categoria=${c.slug}`}
              className="text-sm font-medium text-espresso-soft transition hover:text-sage"
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
            placeholder={t.header.searchPlaceholder}
            className="w-full rounded-full border border-line bg-cream-dark/60 py-2 pl-9 pr-3 text-sm text-espresso transition placeholder:text-espresso-soft/70 focus:border-sage focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-4 sm:ml-0">
          <LanguageSwitcher label={t.languageSwitcher.label} current={locale} />

          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              aria-label={t.header.accountMenuLabel}
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((v) => !v)}
              className="text-espresso transition hover:text-sage"
            >
              <UserIcon className="h-6 w-6" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-md border border-line bg-white shadow-lg">
                <Link
                  href="/minha-conta"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream-dark/60"
                >
                  {t.header.customerArea}
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block border-t border-line px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream-dark/60"
                >
                  {t.header.adminArea}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/carrinho"
            aria-label={t.header.cartLabel}
            className="relative text-espresso transition hover:text-sage"
          >
            <BagIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[10px] font-semibold text-cream">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
