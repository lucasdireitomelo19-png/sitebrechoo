import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { trackingUrl } from "@/lib/tracking";
import type { OrderStatus } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  PAID: "Aguardando envio",
  SHIPPED: "Em trânsito",
  DELIVERED: "Entregue",
};

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
};

const SHIPPING_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];

export default async function AdminTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus =
    status && SHIPPING_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const [counts, orders] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { status: { in: SHIPPING_STATUSES } },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: {
        status: { in: validStatus ? [validStatus] : SHIPPING_STATUSES },
      },
      include: {
        trackingEvents: { orderBy: { occurredAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">Rastreio</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-line p-4">
          <p className="text-xs font-medium uppercase text-espresso-soft">Aguardando envio</p>
          <p className="mt-1 text-xl font-semibold text-espresso">{countByStatus.PAID ?? 0}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-xs font-medium uppercase text-espresso-soft">Em trânsito</p>
          <p className="mt-1 text-xl font-semibold text-espresso">{countByStatus.SHIPPED ?? 0}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-xs font-medium uppercase text-espresso-soft">Entregues</p>
          <p className="mt-1 text-xl font-semibold text-espresso">{countByStatus.DELIVERED ?? 0}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/rastreio"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !validStatus ? "bg-espresso text-cream" : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
          }`}
        >
          Todos
        </Link>
        {SHIPPING_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/rastreio?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              validStatus === s ? "bg-espresso text-cream" : "bg-cream-dark text-espresso-soft hover:bg-cream-dark/70"
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase text-espresso-soft">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Transportadora</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Última atualização</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => {
              const link = trackingUrl(o.shippingCarrier, o.trackingCode);
              const lastEvent = o.trackingEvents[0];
              return (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-espresso hover:underline">
                      #{o.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-espresso">{o.customerName}</td>
                  <td className="px-4 py-3 text-espresso-soft">{o.shippingCarrier ?? "—"}</td>
                  <td className="px-4 py-3 text-espresso-soft">
                    {o.trackingCode ? (
                      link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-espresso hover:underline"
                        >
                          {o.trackingCode}
                        </a>
                      ) : (
                        o.trackingCode
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_TONE[o.status]}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-espresso-soft">
                    {lastEvent
                      ? `${lastEvent.status} · ${lastEvent.occurredAt.toLocaleDateString("pt-BR")}`
                      : "Sem eventos registrados"}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-espresso-soft">
                  Nenhum pedido nessa situação.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
