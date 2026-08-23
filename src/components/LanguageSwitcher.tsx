"use client";

import { useEffect, useRef, useState } from "react";
import { GlobeIcon } from "@/components/icons";
import { setLocale } from "@/lib/actions/locale";
import type { Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export function LanguageSwitcher({ label, current }: { label: string; current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-espresso transition hover:text-sage"
      >
        <GlobeIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-md border border-line bg-white shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setOpen(false);
                setLocale(lang.code);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-cream-dark/60 ${
                current === lang.code ? "text-sage-dark" : "text-espresso"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
