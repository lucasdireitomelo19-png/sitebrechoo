import { Suspense } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Reveal } from "@/components/Reveal";
import { Filters } from "@/components/Filters";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    sale?: string;
    tamanho?: string;
    condicao?: string;
    marca?: string;
    precoMin?: string;
    precoMax?: string;
  }>;
}) {
  const { categoria, q, sale, tamanho, condicao, marca, precoMin, precoMax } = await searchParams;
  const query = q?.trim();
  const onSale = sale === "1";
  const showDiscovery = !categoria && !query && !onSale;

  const VALID_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;
  const sizes = tamanho ? tamanho.split(",").filter(Boolean) : [];
  const conditions = condicao
    ? condicao
        .split(",")
        .filter((c): c is (typeof VALID_CONDITIONS)[number] =>
          (VALID_CONDITIONS as readonly string[]).includes(c)
        )
    : [];
  const brands = marca ? marca.split(",").filter(Boolean) : [];
  const minCents = precoMin ? Math.round(Number(precoMin) * 100) : undefined;
  const maxCents = precoMax ? Math.round(Number(precoMax) * 100) : undefined;

  const productWhere: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(categoria ? { category: { slug: categoria } } : {}),
    ...(onSale ? { compareAtPriceCents: { not: null } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(sizes.length > 0 ? { size: { in: sizes } } : {}),
    ...(conditions.length > 0 ? { condition: { in: conditions } } : {}),
    ...(brands.length > 0 ? { brand: { in: brands } } : {}),
    ...(minCents !== undefined || maxCents !== undefined
      ? {
          priceCents: {
            ...(minCents !== undefined ? { gte: minCents } : {}),
            ...(maxCents !== undefined ? { lte: maxCents } : {}),
          },
        }
      : {}),
  };

  const [categories, categoryTiles, products, availableSizes, availableBrands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    showDiscovery
      ? prisma.category.findMany({
          orderBy: { name: "asc" },
          include: {
            products: {
              where: { status: "PUBLISHED" },
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { images: { orderBy: { position: "asc" }, take: 1 } },
            },
          },
        })
      : Promise.resolve([]),
    prisma.product.findMany({
      where: productWhere,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", size: { not: null } },
      select: { size: true },
      distinct: ["size"],
      orderBy: { size: "asc" },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  return (
    <div>
      {showDiscovery && (
        <>
          <Hero />
          <div className="pt-10">
            <Reveal>
              <CategoryTiles
                categories={categoryTiles.map((c) => ({
                  name: c.name,
                  slug: c.slug,
                  imageUrl: c.products[0]?.images[0]?.url ?? null,
                }))}
              />
            </Reveal>
          </div>
        </>
      )}

      <div id="catalogo" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h2 className="font-extrabold text-2xl text-espresso sm:text-3xl">
            {query
              ? `Resultados para "${query}"`
              : onSale
                ? "Peças em promoção"
                : "Peças selecionadas"}
          </h2>
          <p className="mt-1 text-sm text-espresso">
            {query ? (
              <>
                {products.length} peça(s) encontrada(s).{" "}
                <Link href="/" className="underline transition hover:text-sage-dark">
                  Limpar busca
                </Link>
              </>
            ) : (
              "Cada peça é única. Garanta a sua antes que acabe."
            )}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              !categoria && !onSale
                ? "bg-espresso text-cream"
                : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
            }`}
          >
            Todas
          </Link>
          <Link
            href="/?sale=1"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              onSale
                ? "bg-espresso text-cream"
                : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
            }`}
          >
            Sale
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${c.slug}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                categoria === c.slug
                  ? "bg-espresso text-cream"
                  : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
              }`}
            >
              {c.name}
            </Link>
          ))}

          <Suspense fallback={null}>
            <Filters
              sizes={availableSizes.map((s) => s.size).filter((s): s is string => Boolean(s))}
              brands={availableBrands.map((b) => b.brand).filter((b): b is string => Boolean(b))}
            />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-espresso">
            {query
              ? "Nenhuma peça encontrada para essa busca."
              : onSale
                ? "Nenhuma peça em promoção no momento."
                : "Nenhuma peça disponível nessa categoria no momento."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 8) * 60}>
                <ProductCard
                  product={{
                    slug: p.slug,
                    title: p.title,
                    priceCents: p.priceCents,
                    compareAtPriceCents: p.compareAtPriceCents,
                    size: p.size,
                    brand: p.brand,
                    condition: p.condition,
                    imageUrl: p.images[0]?.url ?? null,
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
