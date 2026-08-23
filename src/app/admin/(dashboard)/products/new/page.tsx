import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">Novo produto</h1>
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => c.name)}
        submitLabel="Criar produto"
      />
    </div>
  );
}
