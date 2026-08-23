import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { deleteProduct } from "@/lib/actions/products";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  SOLD: "Vendido",
  ARCHIVED: "Arquivado",
};

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600",
  PUBLISHED: "bg-green-50 text-green-700",
  SOLD: "bg-blue-50 text-blue-700",
  ARCHIVED: "bg-stone-100 text-stone-500",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">Produtos</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-stone-900 hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone-500">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-stone-700">{formatCentsToBRL(p.priceCents)}</td>
                <td className="px-4 py-3 text-stone-700">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_TONE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-stone-500 hover:text-stone-900">
                      Editar
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`Excluir "${p.title}"? Essa ação não pode ser desfeita.`}
                        className="text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
