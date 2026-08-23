"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  if (!session?.user || userType !== "admin") {
    throw new Error("Não autorizado.");
  }
}

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "CANCELED",
  "REFUNDED",
  "SHIPPED",
  "DELIVERED",
];

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Status inválido.");
  }
  const nextStatus = status as OrderStatus;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    throw new Error("Pedido não encontrado.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: nextStatus } });

    // O estoque é reservado na criação do pedido (checkout), não na
    // confirmação de pagamento — então cancelar/reembolsar é o que devolve
    // a peça ao estoque. Só devolve uma vez, saindo de um estado que ainda
    // segurava a reserva.
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

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/pedido/${id}`);
}
