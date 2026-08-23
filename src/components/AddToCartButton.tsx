"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export function AddToCartButton({
  productId,
  slug,
  title,
  priceCents,
  image,
  maxStock,
}: {
  productId: string;
  slug: string;
  title: string;
  priceCents: number;
  image: string | null;
  maxStock: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (maxStock <= 0) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-md bg-stone-200 px-4 py-3 text-sm font-medium text-stone-500"
      >
        Peça esgotada
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => {
          addItem({ productId, slug, title, priceCents, image, maxStock }, 1);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="flex-1 rounded-md bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
      <button
        onClick={() => {
          addItem({ productId, slug, title, priceCents, image, maxStock }, 1);
          router.push("/carrinho");
        }}
        className="flex-1 rounded-md border border-stone-300 px-4 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
      >
        Comprar agora
      </button>
    </div>
  );
}
