"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MenuIcon, CloseIcon, ChevronRightIcon } from "@/components/icons";

export type MenuCategory = { name: string; slug: string };

export function MobileMenu({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
        className="text-espresso transition hover:text-rust sm:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 sm:hidden">
            <button
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-espresso/50"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-cream shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-4">
                <span className="font-serif text-lg italic text-espresso">Menu</span>
                <button aria-label="Fechar menu" onClick={() => setOpen(false)}>
                  <CloseIcon className="h-5 w-5 text-espresso-soft" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-espresso hover:bg-cream-dark/60"
                >
                  Todas as peças
                  <ChevronRightIcon className="h-4 w-4 text-espresso-soft" />
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/?categoria=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-espresso hover:bg-cream-dark/60"
                  >
                    {c.name}
                    <ChevronRightIcon className="h-4 w-4 text-espresso-soft" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
