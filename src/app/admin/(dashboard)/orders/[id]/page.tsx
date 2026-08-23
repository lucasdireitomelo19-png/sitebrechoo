import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { updateOrderStatus } from "@/lib/actions/orders";
import { updateShipping, addTrackingEvent, deleteTrackingEvent } from "@/lib/actions/tracking";
import { CARRIERS, trackingUrl } from "@/lib/tracking";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
};

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      trackingEvents: { orderBy: { occurredAt: "desc" } },
    },
  });

  if (!order) notFound();

  const updateWithId = updateOrderStatus.bind(null, id);
  const updateShippingWithId = updateShipping.bind(null, id);
  const addEventWithId = addTrackingEvent.bind(null, id);
  const link = trackingUrl(order.shippingCarrier, order.trackingCode);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-espresso-soft hover:text-espresso">
        ← Voltar aos pedidos
      </Link>
      <h1 className="mt-2 mb-6 text-xl font-semibold text-espresso">
        Pedido #{order.id.slice(-8)}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <h2 className="mb-2 text-sm font-semibold text-espresso">Cliente</h2>
          <p className="text-sm text-espresso">{order.customerName}</p>
          <p className="text-sm text-espresso-soft">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-espresso-soft">{order.customerPhone}</p>}
          {order.customerTaxId && <p className="text-sm text-espresso-soft">CPF: {order.customerTaxId}</p>}
        </div>

        <div className="rounded-lg border border-line p-4">
          <h2 className="mb-2 text-sm font-semibold text-espresso">Entrega</h2>
          {order.shippingAddress ? (
            <>
              <p className="text-sm text-espresso">{order.shippingAddress}</p>
              <p className="text-sm text-espresso-soft">
                {order.shippingCity} - {order.shippingState}, {order.shippingZip}
              </p>
            </>
          ) : (
            <p className="text-sm text-espresso-soft">Não informado</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line p-4">
        <h2 className="mb-3 text-sm font-semibold text-espresso">Itens</h2>
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-espresso">
                {item.titleSnapshot} × {item.quantity}
              </span>
              <span className="font-medium text-espresso">
                {formatCentsToBRL(item.priceCentsSnapshot * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
          <span className="font-medium text-espresso-soft">Total</span>
          <span className="text-lg font-semibold text-espresso">
            {formatCentsToBRL(order.totalCents)}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line p-4">
        <h2 className="mb-3 text-sm font-semibold text-espresso">Status do pedido</h2>
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
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-cream hover:bg-sage"
          >
            Atualizar
          </button>
        </form>
        {order.paymentLink && (
          <a
            href={order.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-espresso-soft hover:text-espresso hover:underline"
          >
            Ver link de pagamento no PagBank →
          </a>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-line p-4">
        <h2 className="mb-3 text-sm font-semibold text-espresso">Rastreio</h2>

        <form action={updateShippingWithId} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select name="shippingCarrier" defaultValue={order.shippingCarrier ?? ""} className="input">
            <option value="">Selecione a transportadora</option>
            {CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            name="trackingCode"
            defaultValue={order.trackingCode ?? ""}
            placeholder="Código de rastreio"
            className="input"
          />
          <button
            type="submit"
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-cream hover:bg-sage"
          >
            Salvar
          </button>
        </form>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-espresso-soft hover:text-espresso hover:underline"
          >
            Ver rastreio no site da transportadora →
          </a>
        )}

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-espresso-soft">
            Linha do tempo
          </h3>

          {order.trackingEvents.length === 0 ? (
            <p className="text-sm text-espresso-soft">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="space-y-4 border-l border-line pl-4">
              {order.trackingEvents.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-espresso" />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-espresso">{event.status}</p>
                      {event.location && (
                        <p className="text-xs text-espresso-soft">{event.location}</p>
                      )}
                      {event.note && <p className="mt-1 text-xs text-espresso-soft">{event.note}</p>}
                      <p className="mt-1 text-xs text-espresso-soft">
                        {event.occurredAt.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <form action={deleteTrackingEvent.bind(null, event.id, id)}>
                      <ConfirmSubmitButton
                        confirmMessage="Remover este evento da linha do tempo?"
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remover
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form action={addEventWithId} className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso-soft">
              Adicionar evento
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="status"
                required
                placeholder="Ex: Objeto postado, Saiu para entrega..."
                className="input"
              />
              <input name="location" placeholder="Local (opcional)" className="input" />
            </div>
            <input name="note" placeholder="Observação (opcional)" className="input" />
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                name="occurredAt"
                defaultValue={toDatetimeLocal(new Date())}
                className="input max-w-xs"
              />
              <button
                type="submit"
                className="rounded-md border border-line px-4 py-2 text-sm font-medium text-espresso hover:bg-cream-dark"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
