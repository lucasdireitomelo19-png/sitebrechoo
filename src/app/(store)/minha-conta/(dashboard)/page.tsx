import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";

export const metadata = {
  title: "Meus pedidos | Carcamana's",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
};

export default async function MinhaContaPage() {
  const session = await auth();
  const email = session!.user!.email!;

  const orders = await prisma.order.findMany({
    where: { customerEmail: email },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div>
        <p className="text-sm text-espresso-soft">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
        >
          Ver peças disponíveis
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-espresso">Meus pedidos</h2>
      <ul className="divide-y divide-line border-y border-line">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/pedido/${order.id}`}
              className="flex items-center justify-between gap-4 py-4 transition hover:opacity-80"
            >
              <div>
                <p className="text-sm font-medium text-espresso">Pedido #{order.id.slice(-8)}</p>
                <p className="mt-0.5 text-xs text-espresso-soft">
                  {order.createdAt.toLocaleDateString("pt-BR")} · {order.items.length} peça(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-espresso">
                  {formatCentsToBRL(order.totalCents)}
                </p>
                <p className="mt-0.5 text-xs text-espresso-soft">
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
