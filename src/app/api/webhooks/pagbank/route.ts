import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPagBankCheckout, normalizePagBankStatus } from "@/lib/pagbank";
import type { OrderStatus } from "@prisma/client";

/**
 * Webhook de notificação do PagBank.
 *
 * Nunca confiamos apenas no corpo recebido: extraímos o id do checkout/pedido
 * e reconsultamos a API do PagBank para confirmar o status real antes de
 * atualizar o pedido. Isso protege contra notificações falsificadas.
 */
function extractCheckoutId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;

  if (typeof body.id === "string") return body.id;
  if (typeof body.checkout_id === "string") return body.checkout_id;

  const checkout = body.checkout as Record<string, unknown> | undefined;
  if (checkout && typeof checkout.id === "string") return checkout.id;

  return null;
}

const STATUS_MAP: Record<string, OrderStatus> = {
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  CANCELED: "CANCELED",
  PENDING: "PENDING",
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const checkoutId = extractCheckoutId(payload);

  if (!checkoutId) {
    return NextResponse.json({ ok: true, ignored: "no id" });
  }

  const order = await prisma.order.findFirst({
    where: { OR: [{ pagbankCheckoutId: checkoutId }, { pagbankOrderId: checkoutId }] },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ ok: true, ignored: "unknown order" });
  }

  let normalized: ReturnType<typeof normalizePagBankStatus>;
  try {
    const checkout = await getPagBankCheckout(checkoutId);
    normalized = normalizePagBankStatus(checkout);
  } catch (error) {
    console.error("Erro ao confirmar status do checkout no PagBank:", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const nextStatus = STATUS_MAP[normalized];

  if (nextStatus && nextStatus !== order.status) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: nextStatus } });

      // O estoque é reservado na criação do pedido (checkout), não aqui —
      // então uma confirmação de pagamento não mexe no estoque. Só um
      // cancelamento/reembolso devolve a peça, e só uma vez.
      const wasHolding = order.status !== "CANCELED" && order.status !== "REFUNDED";
      if ((nextStatus === "CANCELED" || nextStatus === "REFUNDED") && wasHolding) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { increment: item.quantity },
              status: product.status === "SOLD" ? "PUBLISHED" : product.status,
            },
          });
        }
      }
    });
  }

  return NextResponse.json({ ok: true });
}
