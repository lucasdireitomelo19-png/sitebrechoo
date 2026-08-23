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
  condition: string;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-stone-200 transition hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
            Sem foto
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-stone-900">{product.title}</p>
        <p className="mt-1 text-xs text-stone-500">
          {product.size ? `Tam. ${product.size} · ` : ""}
          {CONDITION_LABEL[product.condition] ?? product.condition}
        </p>
        <p className="mt-2 text-sm font-semibold text-stone-900">
          {formatCentsToBRL(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
