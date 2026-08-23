import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">Editar produto</h1>
      <ProductForm
        action={updateWithId}
        categories={categories.map((c) => c.name)}
        submitLabel="Salvar alterações"
        product={{
          title: product.title,
          description: product.description,
          priceCents: product.priceCents,
          compareAtPriceCents: product.compareAtPriceCents,
          size: product.size,
          brand: product.brand,
          condition: product.condition,
          status: product.status,
          stock: product.stock,
          categoryName: product.category?.name ?? null,
          images: product.images.map((img) => ({ id: img.id, url: img.url })),
        }}
      />
    </div>
  );
}
