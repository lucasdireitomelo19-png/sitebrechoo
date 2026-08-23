/**
 * Cliente mínimo para a Checkout API do PagBank (PagSeguro).
 *
 * Docs oficiais: https://developer.pagbank.com.br/reference/criar-checkout
 * Sandbox: https://sandbox.api.pagseguro.com
 * Produção: https://api.pagseguro.com
 *
 * Antes de ir para produção, confira a doc oficial: nomes de campos e o
 * formato da resposta podem mudar entre versões da API do PagBank.
 */

export type PagBankCheckoutItem = {
  reference_id: string;
  name: string;
  quantity: number;
  unit_amount: number;
};

export type PagBankCustomer = {
  name: string;
  email: string;
  tax_id?: string;
  phone?: {
    country: string;
    area: string;
    number: string;
  };
};

export type CreateCheckoutInput = {
  referenceId: string;
  items: PagBankCheckoutItem[];
  customer: PagBankCustomer;
  redirectUrl: string;
  notificationUrls: string[];
  shipping?: {
    address: {
      street: string;
      number: string;
      complement?: string;
      locality?: string;
      city: string;
      region_code: string;
      country: string;
      postal_code: string;
    };
  };
};

export type PagBankLink = {
  rel: string;
  href: string;
  method?: string;
  media?: string;
};

export type PagBankCheckoutResponse = {
  id: string;
  reference_id?: string;
  status?: string;
  links: PagBankLink[];
};

function getBaseUrl(): string {
  return process.env.PAGBANK_API_URL ?? "https://sandbox.api.pagseguro.com";
}

function getToken(): string {
  const token = process.env.PAGBANK_TOKEN;
  if (!token) {
    throw new Error(
      "PAGBANK_TOKEN não configurado. Defina a variável de ambiente com o token da sua conta PagBank."
    );
  }
  return token;
}

export function extractPaymentLink(response: PagBankCheckoutResponse): string | null {
  const links = response.links ?? [];
  const payLink =
    links.find((l) => l.rel?.toUpperCase() === "PAY") ??
    links.find((l) => l.href?.includes("/checkouts/") && l.method?.toUpperCase() === "GET") ??
    links.find((l) => l.href?.includes("pagseguro.uol.com.br"));
  return payLink?.href ?? null;
}

export async function createPagBankCheckout(
  input: CreateCheckoutInput
): Promise<PagBankCheckoutResponse> {
  const res = await fetch(`${getBaseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      reference_id: input.referenceId,
      items: input.items,
      customer: input.customer,
      redirect_url: input.redirectUrl,
      notification_urls: input.notificationUrls,
      ...(input.shipping ? { shipping: input.shipping } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao criar checkout no PagBank (HTTP ${res.status}): ${body}`);
  }

  return res.json() as Promise<PagBankCheckoutResponse>;
}

export type NormalizedPaymentStatus = "PAID" | "CANCELED" | "REFUNDED" | "PENDING";

type CheckoutWithCharges = PagBankCheckoutResponse & {
  status?: string;
  charges?: { status?: string }[];
  orders?: { charges?: { status?: string }[] }[];
};

/**
 * Normaliza o status retornado pelo PagBank para o nosso enum interno.
 * Como o formato exato do payload pode variar (checkout x pedido x cobrança),
 * checamos os locais mais comuns onde o status de pagamento aparece.
 */
export function normalizePagBankStatus(response: CheckoutWithCharges): NormalizedPaymentStatus {
  const candidates: (string | undefined)[] = [
    response.status,
    ...(response.charges ?? []).map((c) => c.status),
    ...(response.orders ?? []).flatMap((o) => (o.charges ?? []).map((c) => c.status)),
  ];

  const normalized = candidates
    .filter((s): s is string => Boolean(s))
    .map((s) => s.toUpperCase());

  if (normalized.some((s) => s === "PAID" || s === "AUTHORIZED")) return "PAID";
  if (normalized.some((s) => s === "REFUNDED")) return "REFUNDED";
  if (normalized.some((s) => ["CANCELED", "CANCELLED", "DECLINED", "EXPIRED"].includes(s)))
    return "CANCELED";
  return "PENDING";
}

export async function getPagBankCheckout(checkoutId: string): Promise<PagBankCheckoutResponse> {
  const res = await fetch(`${getBaseUrl()}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar checkout no PagBank (HTTP ${res.status}): ${body}`);
  }

  return res.json() as Promise<PagBankCheckoutResponse>;
}
