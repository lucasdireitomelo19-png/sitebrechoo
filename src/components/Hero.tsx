import Link from "next/link";

export function Hero() {
  return (
    <section className="border-b border-line bg-cream-dark/50">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Moda circular
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl font-serif text-4xl italic leading-tight text-espresso sm:text-5xl">
          Peças com história, escolhidas com carinho
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-espresso-soft sm:text-base">
          Cada item do nosso brechó é único e passa por curadoria antes de chegar até você.
        </p>
        <Link
          href="#catalogo"
          className="mt-7 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream transition hover:bg-rust"
        >
          Ver peças disponíveis
        </Link>
      </div>
    </section>
  );
}
