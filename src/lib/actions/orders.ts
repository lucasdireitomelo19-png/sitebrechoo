"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
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

  await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/pedido/${id}`);
}
