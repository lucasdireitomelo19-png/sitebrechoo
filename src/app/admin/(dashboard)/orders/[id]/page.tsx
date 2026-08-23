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

      <div className="mt-6 rounded-lg border border-stone-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Rastreio</h2>

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
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Salvar
          </button>
        </form>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-stone-500 hover:text-stone-800 hover:underline"
          >
            Ver rastreio no site da transportadora →
          </a>
        )}

        <div className="mt-5 border-t border-stone-100 pt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Linha do tempo
          </h3>

          {order.trackingEvents.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="space-y-4 border-l border-stone-200 pl-4">
              {order.trackingEvents.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{event.status}</p>
                      {event.location && (
                        <p className="text-xs text-stone-500">{event.location}</p>
                      )}
                      {event.note && <p className="mt-1 text-xs text-stone-500">{event.note}</p>}
                      <p className="mt-1 text-xs text-stone-400">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
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
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50"
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
