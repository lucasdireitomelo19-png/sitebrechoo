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
        className="text-stone-700 hover:text-stone-900 sm:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 sm:hidden">
            <button
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
                <span className="text-sm font-semibold text-stone-900">Menu</span>
                <button aria-label="Fechar menu" onClick={() => setOpen(false)}>
                  <CloseIcon className="h-5 w-5 text-stone-500" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
                >
                  Todas as peças
                  <ChevronRightIcon className="h-4 w-4 text-stone-400" />
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/?categoria=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
                  >
                    {c.name}
                    <ChevronRightIcon className="h-4 w-4 text-stone-400" />
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
