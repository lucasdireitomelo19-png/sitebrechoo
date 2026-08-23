import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { RevenueChart } from "@/components/admin/RevenueChart";

const REVENUE_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function AdminDashboardPage() {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - 13);

  const [totalRevenue, orderCounts, recentPaidOrders, pendingCount, totalProducts, topItems, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { totalCents: true },
        where: { status: { in: [...REVENUE_STATUSES] } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.findMany({
        where: { status: { in: [...REVENUE_STATUSES] }, createdAt: { gte: since } },
        select: { createdAt: true, totalCents: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.orderItem.groupBy({
        by: ["titleSnapshot"],
        _sum: { quantity: true },
        where: { order: { status: { in: [...REVENUE_STATUSES] } } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const countByStatus = Object.fromEntries(orderCounts.map((o) => [o.status, o._count._all]));

  const revenueByDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    revenueByDay.set(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const order of recentPaidOrders) {
    const key = order.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.totalCents / 100);
  }
  const chartData = Array.from(revenueByDay.entries()).map(([date, totalReais]) => ({
    date,
    totalReais: Number(totalReais.toFixed(2)),
  }));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-stone-900">Painel</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-stone-200 p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Faturamento</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">
            {formatCentsToBRL(totalRevenue._sum.totalCents ?? 0)}
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Pedidos pendentes</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-stone-200 p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Pedidos pagos</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{countByStatus.PAID ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Produtos publicados</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{totalProducts}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Faturamento (14 dias)</h2>
        <RevenueChart data={chartData} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-stone-900">Mais vendidos</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-stone-400">Ainda sem vendas.</p>
          ) : (
            <ul className="space-y-2">
              {topItems.map((item) => (
                <li key={item.titleSnapshot} className="flex justify-between text-sm">
                  <span className="text-stone-700">{item.titleSnapshot}</span>
                  <span className="font-medium text-stone-900">{item._sum.quantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-stone-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Pedidos recentes</h2>
            <Link href="/admin/orders" className="text-xs text-stone-500 hover:underline">
              ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhum pedido ainda.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex justify-between text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="text-stone-700 hover:underline">
                    #{o.id.slice(-8)} · {o.customerName}
                  </Link>
                  <span className="font-medium text-stone-900">{formatCentsToBRL(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
