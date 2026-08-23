import Link from "next/link";

export type CategoryTile = { name: string; slug: string; imageUrl: string | null };

export function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/?categoria=${c.slug}`}
          className="group relative aspect-square overflow-hidden rounded-lg bg-cream-dark"
        >
          {c.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.imageUrl}
              alt={c.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/0 to-espresso/0" />
          <span className="absolute bottom-2 left-2 font-extrabold text-sm text-cream sm:text-base">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
