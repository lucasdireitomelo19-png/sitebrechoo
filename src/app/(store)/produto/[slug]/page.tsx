import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getDictionary } from "@/lib/i18n";

const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status === "ARCHIVED") {
    return { title: "Peça não encontrada | Carcamana's" };
  }

  const title = `${product.title} | Carcamana's`;
  const description = product.description.slice(0, 160);
  const imageUrl = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, t] = await Promise.all([getProductBySlug(slug), getDictionary()]);

  if (!product || product.status === "ARCHIVED") {
    notFound();
  }

  const CONDITION_LABEL: Record<string, string> = {
    NEW: t.common.conditionNew,
    LIKE_NEW: t.common.conditionLikeNew,
    GOOD: t.common.conditionGood,
    FAIR: t.common.conditionFair,
  };

  const mainImage = product.images[0]?.url ?? null;
  const available = product.status === "PUBLISHED" && product.stock > 0;
  const onSale = !!product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const discountPct = onSale
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-dark">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-espresso-soft">
                  {t.common.noPhoto}
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt={product.title}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                {product.category.name}
              </p>
            )}
            <h1 className="mt-1 font-extrabold text-3xl text-espresso">{product.title}</h1>
            <p className="mt-3 flex items-baseline gap-2">
              {onSale && (
                <span className="text-base text-espresso-soft line-through">
                  {formatCentsToBRL(product.compareAtPriceCents!)}
                </span>
              )}
              <span className="text-2xl font-semibold text-espresso">
                {formatCentsToBRL(product.priceCents)}
              </span>
              {onSale && (
                <span className="rounded-full bg-espresso px-2 py-0.5 text-xs font-semibold text-cream">
                  -{discountPct}%
                </span>
              )}
            </p>

            <dl className="mt-5 space-y-1.5 text-sm text-espresso-soft">
              {product.brand && (
                <div className="flex gap-2">
                  <dt className="font-medium text-espresso">{t.product.brandLabel}</dt>
                  <dd>{product.brand}</dd>
                </div>
              )}
              {product.size && (
                <div className="flex gap-2">
                  <dt className="font-medium text-espresso">{t.product.sizeLabel}</dt>
                  <dd>{product.size}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="font-medium text-espresso">{t.product.conditionLabel}</dt>
                <dd>{CONDITION_LABEL[product.condition] ?? product.condition}</dd>
              </div>
            </dl>

            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-espresso-soft">
              {product.description}
            </p>

            <div className="mt-7">
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                title={product.title}
                priceCents={product.priceCents}
                image={mainImage}
                maxStock={available ? product.stock : 0}
                t={t.common}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
