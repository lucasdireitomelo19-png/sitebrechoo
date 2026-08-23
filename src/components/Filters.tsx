"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n/dictionary";

function parseList(value: string | null) {
  return value ? value.split(",").filter(Boolean) : [];
}

export function Filters({
  sizes,
  brands,
  t,
}: {
  sizes: string[];
  brands: string[];
  t: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const CONDITION_OPTIONS = [
    { value: "NEW", label: t.common.conditionNew },
    { value: "LIKE_NEW", label: t.common.conditionLikeNew },
    { value: "GOOD", label: t.common.conditionGood },
    { value: "FAIR", label: t.common.conditionFair },
  ];

  const selectedSizes = parseList(searchParams.get("tamanho"));
  const selectedConditions = parseList(searchParams.get("condicao"));
  const selectedBrands = parseList(searchParams.get("marca"));
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeCount =
    selectedSizes.length +
    selectedConditions.length +
    selectedBrands.length +
    (searchParams.get("precoMin") ? 1 : 0) +
    (searchParams.get("precoMax") ? 1 : 0);

  function applyParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleListValue(key: string, value: string) {
    applyParams((params) => {
      const current = parseList(params.get(key));
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length > 0) {
        params.set(key, next.join(","));
      } else {
        params.delete(key);
      }
    });
  }

  function applyPriceRange() {
    const minPrice = minPriceRef.current?.value ?? "";
    const maxPrice = maxPriceRef.current?.value ?? "";
    applyParams((params) => {
      if (minPrice) {
        params.set("precoMin", minPrice);
      } else {
        params.delete("precoMin");
      }
      if (maxPrice) {
        params.set("precoMax", maxPrice);
      } else {
        params.delete("precoMax");
      }
    });
  }

  function clearAll() {
    if (minPriceRef.current) minPriceRef.current.value = "";
    if (maxPriceRef.current) maxPriceRef.current.value = "";
    applyParams((params) => {
      params.delete("tamanho");
      params.delete("condicao");
      params.delete("marca");
      params.delete("precoMin");
      params.delete("precoMax");
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-sm font-medium text-espresso-soft transition hover:bg-cream-dark/70"
      >
        <FilterIcon className="h-4 w-4" />
        {t.filters.button}
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-espresso px-1 text-[10px] font-semibold text-cream">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-line bg-white p-4 shadow-lg">
          <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-espresso">
                {t.filters.price}
              </p>
              <div className="flex items-center gap-2">
                <input
                  key={`min-${searchParams.get("precoMin") ?? ""}`}
                  ref={minPriceRef}
                  type="number"
                  min={0}
                  placeholder={t.filters.min}
                  defaultValue={searchParams.get("precoMin") ?? ""}
                  onBlur={applyPriceRange}
                  className="input w-full"
                />
                <span className="text-sm text-espresso-soft">{t.filters.to}</span>
                <input
                  key={`max-${searchParams.get("precoMax") ?? ""}`}
                  ref={maxPriceRef}
                  type="number"
                  min={0}
                  placeholder={t.filters.max}
                  defaultValue={searchParams.get("precoMax") ?? ""}
                  onBlur={applyPriceRange}
                  className="input w-full"
                />
              </div>
            </div>

            {sizes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-espresso">
                  {t.filters.size}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleListValue("tamanho", size)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        selectedSizes.includes(size)
                          ? "border-espresso bg-espresso text-cream"
                          : "border-line text-espresso-soft hover:border-sage"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-espresso">
                {t.filters.condition}
              </p>
              <div className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleListValue("condicao", c.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selectedConditions.includes(c.value)
                        ? "border-espresso bg-espresso text-cream"
                        : "border-line text-espresso-soft hover:border-sage"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {brands.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-espresso">
                  {t.filters.brand}
                </p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleListValue("marca", brand)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        selectedBrands.includes(brand)
                          ? "border-espresso bg-espresso text-cream"
                          : "border-line text-espresso-soft hover:border-sage"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 w-full rounded-full border border-line py-2 text-sm font-medium text-espresso-soft transition hover:border-sage hover:text-sage-dark"
            >
              {t.filters.clear}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
