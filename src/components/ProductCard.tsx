import Link from "next/link";
import { formatCentsToBRL } from "@/lib/money";
import type { Dictionary } from "@/lib/i18n/dictionary";

export type ProductCardData = {
  slug: string;
  title: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  size: string | null;
  brand: string | null;
  condition: string;
  imageUrl: string | null;
};

export function ProductCard({
  product,
  t,
}: {
  product: ProductCardData;
  t: Dictionary["common"];
}) {
  const CONDITION_LABEL: Record<string, string> = {
    NEW: t.conditionNew,
    LIKE_NEW: t.conditionLikeNew,
    GOOD: t.conditionGood,
    FAIR: t.conditionFair,
  };
  const onSale = !!product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const discountPct = onSale
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : 0;

  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-dark shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-espresso-soft">
            {t.noPhoto}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2 py-0.5 text-[11px] font-medium text-espresso shadow-sm">
          {CONDITION_LABEL[product.condition] ?? product.condition}
        </span>
        {onSale && (
          <span className="absolute right-2 top-2 rounded-full bg-espresso px-2 py-0.5 text-[11px] font-semibold text-cream shadow-sm">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="pt-3">
        {product.brand && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sage-dark">
            {product.brand}
          </p>
        )}
        <p className="mt-0.5 truncate text-sm font-medium text-espresso transition-colors group-hover:text-sage-dark">
          {product.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          {product.size && (
            <p className="text-xs text-espresso">
              {t.size} {product.size}
            </p>
          )}
          <p className="flex items-baseline gap-1.5">
            {onSale && (
              <span className="text-xs text-espresso-soft line-through">
                {formatCentsToBRL(product.compareAtPriceCents!)}
              </span>
            )}
            <span className="text-sm font-semibold text-espresso">
              {formatCentsToBRL(product.priceCents)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
