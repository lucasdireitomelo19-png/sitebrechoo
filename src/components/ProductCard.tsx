import Link from "next/link";
import { formatCentsToBRL } from "@/lib/money";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom estado",
  FAIR: "Estado regular",
};

export type ProductCardData = {
  slug: string;
  title: string;
  priceCents: number;
  size: string | null;
  brand: string | null;
  condition: string;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-dark">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-espresso-soft">
            Sem foto
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2 py-0.5 text-[11px] font-medium text-espresso shadow-sm">
          {CONDITION_LABEL[product.condition] ?? product.condition}
        </span>
      </div>
      <div className="pt-3">
        {product.brand && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rust">
            {product.brand}
          </p>
        )}
        <p className="mt-0.5 truncate text-sm font-medium text-espresso">{product.title}</p>
        <div className="mt-1 flex items-center justify-between">
          {product.size && <p className="text-xs text-espresso-soft">Tam. {product.size}</p>}
          <p className="text-sm font-semibold text-espresso">
            {formatCentsToBRL(product.priceCents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
