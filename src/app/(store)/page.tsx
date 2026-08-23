import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { CategoryTiles } from "@/components/CategoryTiles";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const query = q?.trim();
  const showDiscovery = !categoria && !query;

  const [categories, categoryTiles, products] = await Promise.all([
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
      where: {
        status: "PUBLISHED",
        ...(categoria ? { category: { slug: categoria } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      {showDiscovery && (
        <>
          <Hero />
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
            <CategoryTiles
              categories={categoryTiles.map((c) => ({
                name: c.name,
                slug: c.slug,
                imageUrl: c.products[0]?.images[0]?.url ?? null,
              }))}
            />
          </div>
        </>
      )}

      <div id="catalogo" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h2 className="font-serif text-2xl italic text-espresso sm:text-3xl">
            {query ? `Resultados para "${query}"` : "Peças selecionadas"}
          </h2>
          <p className="mt-1 text-sm text-espresso-soft">
            {query ? (
              <>
                {products.length} peça(s) encontrada(s).{" "}
                <Link href="/" className="underline hover:text-rust">
                  Limpar busca
                </Link>
              </>
            ) : (
              "Cada peça é única. Garanta a sua antes que acabe."
            )}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              !categoria
                ? "bg-espresso text-cream"
                : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
            }`}
          >
            Todas
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
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-espresso-soft">
            {query
              ? "Nenhuma peça encontrada para essa busca."
              : "Nenhuma peça disponível nessa categoria no momento."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  slug: p.slug,
                  title: p.title,
                  priceCents: p.priceCents,
                  size: p.size,
                  brand: p.brand,
                  condition: p.condition,
                  imageUrl: p.images[0]?.url ?? null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
