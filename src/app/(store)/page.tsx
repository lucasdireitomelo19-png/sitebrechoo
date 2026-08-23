import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const query = q?.trim();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          {query ? `Resultados para "${query}"` : "Peças selecionadas"}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {query ? (
            <>
              {products.length} peça(s) encontrada(s).{" "}
              <Link href="/" className="underline hover:text-stone-800">
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
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !categoria ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?categoria=${c.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              categoria === c.slug
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone-500">
          {query
            ? "Nenhuma peça encontrada para essa busca."
            : "Nenhuma peça disponível nessa categoria no momento."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                slug: p.slug,
                title: p.title,
                priceCents: p.priceCents,
                size: p.size,
                condition: p.condition,
                imageUrl: p.images[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
