"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  if (!session?.user || userType !== "admin") {
    throw new Error("Não autorizado.");
  }
}

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/rastreio");
  revalidatePath(`/pedido/${id}`);
}

export async function updateShipping(id: string, formData: FormData) {
  await requireAdmin();

  const shippingCarrier = String(formData.get("shippingCarrier") ?? "").trim() || null;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim() || null;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Pedido não encontrado.");

  // Assim que um código de rastreio é adicionado a um pedido pago, já
  // avançamos o status para "Enviado" automaticamente.
  const shouldMarkShipped = trackingCode && !order.trackingCode && order.status === "PAID";

  await prisma.order.update({
    where: { id },
    data: {
      shippingCarrier,
      trackingCode,
      ...(shouldMarkShipped ? { status: "SHIPPED" } : {}),
    },
  });

  revalidateOrder(id);
}

export async function addTrackingEvent(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const occurredAtRaw = String(formData.get("occurredAt") ?? "");

  if (!status) {
    throw new Error("Descreva o status do evento.");
  }

  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error("Data/hora inválida.");
  }

  await prisma.trackingEvent.create({
    data: { orderId, status, location, note, occurredAt },
  });

  revalidateOrder(orderId);
}

export async function deleteTrackingEvent(eventId: string, orderId: string) {
  await requireAdmin();
  await prisma.trackingEvent.delete({ where: { id: eventId } });
  revalidateOrder(orderId);
}
