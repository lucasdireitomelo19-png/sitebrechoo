type ProductImage = { id: string; url: string };

type ProductDefaults = {
  title: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  size: string | null;
  brand: string | null;
  condition: string;
  status: string;
  stock: number;
  categoryName: string | null;
  images: ProductImage[];
};

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: string[];
  product?: ProductDefaults;
  submitLabel: string;
}) {
  const priceReais = product ? (product.priceCents / 100).toFixed(2) : "";
  const compareAtPriceReais = product?.compareAtPriceCents
    ? (product.compareAtPriceCents / 100).toFixed(2)
    : "";

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-espresso">Título</label>
          <input name="title" defaultValue={product?.title} required className="input" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-espresso">Descrição</label>
          <textarea
            name="description"
            defaultValue={product?.description}
            required
            rows={4}
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Preço (R$)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={priceReais}
            required
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">
            Preço original (opcional, pra promoção)
          </label>
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={compareAtPriceReais}
            placeholder="Deixe em branco se não estiver em promoção"
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Estoque</label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 1}
            required
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Tamanho</label>
          <input name="size" defaultValue={product?.size ?? ""} className="input" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Marca</label>
          <input name="brand" defaultValue={product?.brand ?? ""} className="input" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Condição</label>
          <select name="condition" defaultValue={product?.condition ?? "GOOD"} className="input">
            <option value="NEW">Novo</option>
            <option value="LIKE_NEW">Seminovo</option>
            <option value="GOOD">Bom estado</option>
            <option value="FAIR">Estado regular</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-espresso">Status</label>
          <select name="status" defaultValue={product?.status ?? "PUBLISHED"} className="input">
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="SOLD">Vendido</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-espresso">Categoria</label>
          <input
            name="category"
            list="category-options"
            defaultValue={product?.categoryName ?? ""}
            placeholder="Selecione ou digite uma nova categoria"
            className="input"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      {product && product.images.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-espresso">Fotos atuais</p>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <label key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-24 w-20 rounded-md object-cover" />
                <span className="mt-1 flex items-center gap-1 text-xs text-espresso-soft">
                  <input type="checkbox" name="removeImage" value={img.id} /> remover
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-espresso">
          {product ? "Adicionar novas fotos" : "Fotos"}
        </label>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="block w-full text-sm text-espresso-soft file:mr-3 file:rounded-md file:border-0 file:bg-espresso file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-espresso px-5 py-2.5 text-sm font-medium text-cream hover:bg-sage"
      >
        {submitLabel}
      </button>
    </form>
  );
}
