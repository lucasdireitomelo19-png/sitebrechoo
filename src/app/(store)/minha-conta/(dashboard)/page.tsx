import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { getDictionary, getLocale, format } from "@/lib/i18n";

export const metadata = {
  title: "Meus pedidos | Carcamana's",
};

const DATE_LOCALE: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

export default async function MinhaContaPage() {
  const session = await auth();
  const email = session!.user!.email!;

  const [orders, t, locale] = await Promise.all([
    prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    getDictionary(),
    getLocale(),
  ]);

  const STATUS_LABEL: Record<string, string> = {
    PENDING: t.account.statusPending,
    PAID: t.account.statusPaid,
    CANCELED: t.account.statusCanceled,
    REFUNDED: t.account.statusRefunded,
    SHIPPED: t.account.statusShipped,
    DELIVERED: t.account.statusDelivered,
  };

  if (orders.length === 0) {
    return (
      <div>
        <p className="text-sm text-espresso-soft">{t.account.noOrders}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
        >
          {t.common.seeAvailable}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-espresso">{t.account.myOrders}</h2>
      <ul className="divide-y divide-line border-y border-line">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/pedido/${order.id}`}
              className="flex items-center justify-between gap-4 py-4 transition hover:opacity-80"
            >
              <div>
                <p className="text-sm font-medium text-espresso">
                  {format(t.account.orderNumber, { id: order.id.slice(-8) })}
                </p>
                <p className="mt-0.5 text-xs text-espresso-soft">
                  {order.createdAt.toLocaleDateString(DATE_LOCALE[locale])} · {order.items.length}{" "}
                  {t.account.pieces}
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
