"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, cartTotalCents } from "@/store/cart";
import { formatCentsToBRL } from "@/lib/money";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function CheckoutPage() {
  const { t } = useLocale();
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const total = cartTotalCents(items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-espresso-soft">{t.cart.empty}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
          >
            {t.common.seeAvailable}
          </Link>
        </div>
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
        setError(data.error ?? t.checkout.genericError);
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
      setError(t.checkout.connectionError);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 font-extrabold text-2xl text-espresso">{t.checkout.title}</h1>

        <div className="mb-6 rounded-md bg-cream-dark/60 p-4 text-sm text-espresso-soft">
          <p className="flex justify-between">
            <span>
              {items.length} {t.checkout.items}
            </span>
            <span className="font-semibold text-espresso">{formatCentsToBRL(total)}</span>
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-espresso">{t.checkout.yourData}</legend>
            <input name="name" required placeholder={t.checkout.fullName} className="store-input" />
            <input name="email" type="email" required placeholder={t.checkout.email} className="store-input" />
            <div className="grid grid-cols-2 gap-3">
              <input name="phone" required placeholder={t.checkout.phone} className="store-input" />
              <input name="taxId" required placeholder={t.checkout.taxId} className="store-input" />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-espresso">
              {t.checkout.shippingAddress}
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <input name="street" required placeholder={t.checkout.street} className="store-input col-span-2" />
              <input name="number" required placeholder={t.checkout.number} className="store-input" />
            </div>
            <input name="complement" placeholder={t.checkout.complement} className="store-input" />
            <div className="grid grid-cols-3 gap-3">
              <input name="city" required placeholder={t.checkout.city} className="store-input col-span-2" />
              <input
                name="state"
                required
                maxLength={2}
                placeholder={t.checkout.state}
                className="store-input uppercase"
              />
            </div>
            <input name="zip" required placeholder={t.checkout.zip} className="store-input" />
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-espresso px-4 py-3 text-sm font-medium text-cream transition hover:bg-sage disabled:opacity-60"
          >
            {loading ? t.checkout.redirecting : t.checkout.payButton}
          </button>
        </form>
      </div>
    </div>
  );
}
