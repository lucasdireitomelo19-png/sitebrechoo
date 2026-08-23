"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, cartTotalCents } from "@/store/cart";
import { formatCentsToBRL } from "@/lib/money";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const total = cartTotalCents(items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-espresso-soft">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream hover:bg-sage"
        >
          Ver peças disponíveis
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customer: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        taxId: String(formData.get("taxId") ?? ""),
      },
      shipping: {
        street: String(formData.get("street") ?? ""),
        number: String(formData.get("number") ?? ""),
        complement: String(formData.get("complement") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? "").toUpperCase(),
        zip: String(formData.get("zip") ?? ""),
      },
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível registrar seu pedido.");
        setLoading(false);
        if (data.orderId) {
          router.push(`/pedido/${data.orderId}`);
        }
        return;
      }

      useCartStore.getState().clear();

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }

      router.push(`/pedido/${data.orderId}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl italic text-espresso">Finalizar compra</h1>

      <div className="mb-6 rounded-md bg-cream-dark/60 p-4 text-sm text-espresso-soft">
        <p className="flex justify-between">
          <span>{items.length} peça(s)</span>
          <span className="font-semibold text-espresso">{formatCentsToBRL(total)}</span>
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-espresso">Seus dados</legend>
          <input name="name" required placeholder="Nome completo" className="store-input" />
          <input name="email" type="email" required placeholder="E-mail" className="store-input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="phone" required placeholder="Telefone (com DDD)" className="store-input" />
            <input name="taxId" required placeholder="CPF" className="store-input" />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-espresso">Endereço de entrega</legend>
          <div className="grid grid-cols-3 gap-3">
            <input name="street" required placeholder="Rua" className="store-input col-span-2" />
            <input name="number" required placeholder="Número" className="store-input" />
          </div>
          <input name="complement" placeholder="Complemento (opcional)" className="store-input" />
          <div className="grid grid-cols-3 gap-3">
            <input name="city" required placeholder="Cidade" className="store-input col-span-2" />
            <input
              name="state"
              required
              maxLength={2}
              placeholder="UF"
              className="store-input uppercase"
            />
          </div>
          <input name="zip" required placeholder="CEP" className="store-input" />
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-espresso px-4 py-3 text-sm font-medium text-cream transition hover:bg-sage disabled:opacity-60"
        >
          {loading ? "Redirecionando para pagamento..." : "Pagar com PagBank"}
        </button>
      </form>
    </div>
  );
}
