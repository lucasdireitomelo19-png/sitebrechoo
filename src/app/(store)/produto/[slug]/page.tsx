import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom estado",
  FAIR: "Estado regular",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });

  if (!product || product.status === "ARCHIVED") {
    notFound();
  }

  const mainImage = product.images[0]?.url ?? null;
  const available = product.status === "PUBLISHED" && product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-dark">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-espresso-soft">
                Sem foto
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
          <p className="mt-3 text-2xl font-semibold text-espresso">
            {formatCentsToBRL(product.priceCents)}
          </p>

          <dl className="mt-5 space-y-1.5 text-sm text-espresso-soft">
            {product.brand && (
              <div className="flex gap-2">
                <dt className="font-medium text-espresso">Marca:</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            {product.size && (
              <div className="flex gap-2">
                <dt className="font-medium text-espresso">Tamanho:</dt>
                <dd>{product.size}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-medium text-espresso">Condição:</dt>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
