import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCentsToBRL } from "@/lib/money";
import { trackingUrl } from "@/lib/tracking";
import { getDictionary, getLocale, format } from "@/lib/i18n";

const DATE_LOCALE: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, session, t, locale] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        trackingEvents: { orderBy: { occurredAt: "desc" } },
      },
    }),
    auth(),
    getDictionary(),
    getLocale(),
  ]);

  if (!order) notFound();

  // O link do pedido funciona sem login (checkout de convidado), mas se
  // alguém estiver logado como cliente, só pode ver os próprios pedidos.
  const sessionUser = session?.user as { email?: string | null; userType?: string } | undefined;
  if (
    sessionUser?.userType === "customer" &&
    sessionUser.email?.toLowerCase() !== order.customerEmail.toLowerCase()
  ) {
    notFound();
  }

  const STATUS_INFO: Record<string, { label: string; tone: string; description: string }> = {
    PENDING: {
      label: t.order.statusPendingLabel,
      tone: "bg-amber-50 text-amber-700",
      description: t.order.statusPendingDesc,
    },
    PAID: {
      label: t.order.statusPaidLabel,
      tone: "bg-green-50 text-green-700",
      description: t.order.statusPaidDesc,
    },
    CANCELED: {
      label: t.order.statusCanceledLabel,
      tone: "bg-cream-dark text-espresso-soft",
      description: t.order.statusCanceledDesc,
    },
    REFUNDED: {
      label: t.order.statusRefundedLabel,
      tone: "bg-cream-dark text-espresso-soft",
      description: t.order.statusRefundedDesc,
    },
    SHIPPED: {
      label: t.order.statusShippedLabel,
      tone: "bg-blue-50 text-blue-700",
      description: t.order.statusShippedDesc,
    },
    DELIVERED: {
      label: t.order.statusDeliveredLabel,
      tone: "bg-green-50 text-green-700",
      description: t.order.statusDeliveredDesc,
    },
  };

  const info = STATUS_INFO[order.status] ?? STATUS_INFO.PENDING;
  const link = trackingUrl(order.shippingCarrier, order.trackingCode);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">
          {format(t.order.orderNumber, { id: order.id.slice(-8) })}
        </p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">{t.order.thankYou}</h1>

        <span className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${info.tone}`}>
          {info.label}
        </span>
        <p className="mt-2 text-sm text-espresso-soft">{info.description}</p>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-espresso-soft">
                {item.titleSnapshot} × {item.quantity}
              </span>
              <span className="font-medium text-espresso">
                {formatCentsToBRL(item.priceCentsSnapshot * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-sm">
          <span className="font-medium text-espresso-soft">{t.order.total}</span>
          <span className="text-lg font-semibold text-espresso">
            {formatCentsToBRL(order.totalCents)}
          </span>
        </div>

        {(order.trackingCode || order.trackingEvents.length > 0) && (
          <div className="mt-8 rounded-lg border border-line p-5">
            <h2 className="text-sm font-semibold text-espresso">{t.order.tracking}</h2>
            {order.trackingCode && (
              <p className="mt-1 text-sm text-espresso-soft">
                {order.shippingCarrier && <>{order.shippingCarrier} · </>}
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-sage transition hover:underline">
                    {order.trackingCode}
                  </a>
                ) : (
                  order.trackingCode
                )}
              </p>
            )}

            {order.trackingEvents.length > 0 && (
              <ul className="mt-4 space-y-4 border-l border-line pl-4">
                {order.trackingEvents.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-sage" />
                    <p className="text-sm font-medium text-espresso">{event.status}</p>
                    {event.location && <p className="text-xs text-espresso-soft">{event.location}</p>}
                    <p className="mt-1 text-xs text-espresso-soft/70">
                      {event.occurredAt.toLocaleString(DATE_LOCALE[locale])}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-espresso px-5 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream-dark"
        >
          {t.order.continueShopping}
        </Link>
      </div>
    </div>
  );
}
