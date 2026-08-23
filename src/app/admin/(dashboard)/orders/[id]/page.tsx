import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const updateWithId = updateOrderStatus.bind(null, id);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar aos pedidos
      </Link>
      <h1 className="mt-2 mb-6 text-xl font-semibold text-stone-900">
        Pedido #{order.id.slice(-8)}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-stone-900">Cliente</h2>
          <p className="text-sm text-stone-700">{order.customerName}</p>
          <p className="text-sm text-stone-500">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-stone-500">{order.customerPhone}</p>}
          {order.customerTaxId && <p className="text-sm text-stone-500">CPF: {order.customerTaxId}</p>}
        </div>

        <div className="rounded-lg border border-stone-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-stone-900">Entrega</h2>
          {order.shippingAddress ? (
            <>
              <p className="text-sm text-stone-700">{order.shippingAddress}</p>
              <p className="text-sm text-stone-500">
                {order.shippingCity} - {order.shippingState}, {order.shippingZip}
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-400">Não informado</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Itens</h2>
        <ul className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-stone-700">
                {item.titleSnapshot} × {item.quantity}
              </span>
              <span className="font-medium text-stone-900">
                {formatCentsToBRL(item.priceCentsSnapshot * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-sm">
          <span className="font-medium text-stone-600">Total</span>
          <span className="text-lg font-semibold text-stone-900">
            {formatCentsToBRL(order.totalCents)}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Status do pedido</h2>
        <form action={updateWithId} className="flex items-center gap-3">
          <select name="status" defaultValue={order.status} className="input max-w-xs">
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Atualizar
          </button>
        </form>
        {order.paymentLink && (
          <a
            href={order.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-stone-500 hover:text-stone-800 hover:underline"
          >
            Ver link de pagamento no PagBank →
          </a>
        )}
      </div>
    </div>
  );
}
