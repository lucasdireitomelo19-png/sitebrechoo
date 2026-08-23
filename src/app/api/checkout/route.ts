import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/checkout-schema";
import { createPagBankCheckout, extractPaymentLink } from "@/lib/pagbank";

function onlyDigits(value: string | undefined | null): string {
  return (value ?? "").replace(/\D/g, "");
}

class OutOfStockError extends Error {
  constructor(public productTitle: string) {
    super(`Estoque insuficiente para: ${productTitle}`);
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items, customer, shipping } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: `Produto indisponível: ${product?.title ?? item.productId}` },
        { status: 409 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente para: ${product.title}` },
        { status: 409 }
      );
    }
  }

  const totalCents = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.priceCents * item.quantity;
  }, 0);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Reserva o estoque de forma atômica: se duas pessoas comprarem a
      // mesma peça ao mesmo tempo, só a primeira transação consegue
      // decrementar — a segunda cai no catch abaixo com "estoque insuficiente".
      for (const item of items) {
        const product = productById.get(item.productId)!;
        const result = await tx.product.updateMany({
          where: { id: item.productId, status: "PUBLISHED", stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new OutOfStockError(product.title);
        }
        const updated = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (updated?.stock === 0) {
          await tx.product.update({ where: { id: item.productId }, data: { status: "SOLD" } });
        }
      }

      return tx.order.create({
        data: {
          status: "PENDING",
          totalCents,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || null,
          customerTaxId: customer.taxId || null,
          shippingAddress: shipping ? `${shipping.street}, ${shipping.number}${shipping.complement ? ` - ${shipping.complement}` : ""}` : null,
          shippingCity: shipping?.city ?? null,
          shippingState: shipping?.state ?? null,
          shippingZip: shipping?.zip ?? null,
          items: {
            create: items.map((item) => {
              const product = productById.get(item.productId)!;
              return {
                productId: product.id,
                titleSnapshot: product.title,
                priceCentsSnapshot: product.priceCents,
                quantity: item.quantity,
              };
            }),
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const phoneDigits = onlyDigits(customer.phone);
  const taxIdDigits = onlyDigits(customer.taxId);

  if (!process.env.PAGBANK_TOKEN) {
    // Pagamento online ainda não configurado: o pedido fica registrado como
    // pendente e o cliente é avisado, em vez de ver um erro genérico.
    return NextResponse.json(
      {
        orderId: order.id,
        error:
          "Pagamento online ainda não está disponível. Recebemos seu pedido e entraremos em contato para combinar o pagamento.",
      },
      { status: 200 }
    );
  }

  try {
    const checkout = await createPagBankCheckout({
      referenceId: order.id,
      items: items.map((item) => {
        const product = productById.get(item.productId)!;
        return {
          reference_id: product.id,
          name: product.title,
          quantity: item.quantity,
          unit_amount: product.priceCents,
        };
      }),
      customer: {
        name: customer.name,
        email: customer.email,
        ...(taxIdDigits ? { tax_id: taxIdDigits } : {}),
        ...(phoneDigits.length >= 10
          ? {
              phone: {
                country: "55",
                area: phoneDigits.slice(0, 2),
                number: phoneDigits.slice(2),
              },
            }
          : {}),
      },
      redirectUrl: `${siteUrl}/pedido/${order.id}`,
      notificationUrls: [
        process.env.PAGBANK_NOTIFICATION_URL ?? `${siteUrl}/api/webhooks/pagbank`,
      ],
      ...(shipping
        ? {
            shipping: {
              address: {
                street: shipping.street,
                number: shipping.number,
                complement: shipping.complement || undefined,
                city: shipping.city,
                region_code: shipping.state,
                country: "BRA",
                postal_code: onlyDigits(shipping.zip),
              },
            },
          }
        : {}),
    });

    const paymentLink = extractPaymentLink(checkout);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pagbankOrderId: checkout.id,
        pagbankCheckoutId: checkout.id,
        paymentLink,
      },
    });

    if (!paymentLink) {
      return NextResponse.json(
        { orderId: order.id, error: "Checkout criado, mas o link de pagamento não foi retornado." },
        { status: 502 }
      );
    }

    return NextResponse.json({ orderId: order.id, paymentLink });
  } catch (error) {
    console.error("Erro ao criar checkout PagBank:", error);
    return NextResponse.json(
      {
        orderId: order.id,
        error:
          "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.",
      },
      { status: 502 }
    );
  }
}
