import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";

const STATUS_INFO: Record<string, { label: string; tone: string; description: string }> = {
  PENDING: {
    label: "Aguardando pagamento",
    tone: "bg-amber-50 text-amber-700",
    description: "Assim que o pagamento for confirmado pelo PagBank, você receberá um e-mail.",
  },
  PAID: {
    label: "Pagamento confirmado",
    tone: "bg-green-50 text-green-700",
    description: "Seu pedido foi confirmado e já está sendo preparado para envio.",
  },
  CANCELED: {
    label: "Cancelado",
    tone: "bg-stone-100 text-stone-600",
    description: "Este pedido foi cancelado.",
  },
  REFUNDED: {
    label: "Reembolsado",
    tone: "bg-stone-100 text-stone-600",
    description: "O valor deste pedido foi reembolsado.",
  },
  SHIPPED: {
    label: "Enviado",
    tone: "bg-blue-50 text-blue-700",
    description: "Seu pedido já foi enviado.",
  },
  DELIVERED: {
    label: "Entregue",
    tone: "bg-green-50 text-green-700",
    description: "Seu pedido foi entregue.",
  },
};

export default async function OrderStatusPage({
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

  const info = STATUS_INFO[order.status] ?? STATUS_INFO.PENDING;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
        Pedido #{order.id.slice(-8)}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-stone-900">Obrigado pela compra!</h1>

      <span className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${info.tone}`}>
        {info.label}
      </span>
      <p className="mt-2 text-sm text-stone-600">{info.description}</p>

      <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-3 text-sm">
            <span className="text-stone-700">
              {item.titleSnapshot} × {item.quantity}
            </span>
            <span className="font-medium text-stone-900">
              {formatCentsToBRL(item.priceCentsSnapshot * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-sm">
        <span className="font-medium text-stone-600">Total</span>
        <span className="text-lg font-semibold text-stone-900">
          {formatCentsToBRL(order.totalCents)}
        </span>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50"
      >
        Continuar comprando
      </Link>
    </div>
  );
}
