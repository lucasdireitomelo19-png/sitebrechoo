import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[440px] items-center overflow-hidden border-b border-line sm:min-h-[560px]">
      <Image
        src="/hero-mobile.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center sm:hidden"
      />
      <Image
        src="/hero-desktop.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center sm:block"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/35 to-espresso/20" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream">
          Moda circular
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl font-extrabold text-4xl leading-tight text-cream sm:text-5xl">
          Peças com história, escolhidas com carinho
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-cream/85 sm:text-base">
          Cada item do nosso brechó é único e passa por curadoria antes de chegar até você.
        </p>
        <Link
          href="#catalogo"
          className="mt-7 inline-block rounded-full bg-cream px-6 py-3 text-sm font-medium text-espresso transition hover:bg-sage hover:text-cream"
        >
          Ver peças disponíveis
        </Link>
      </div>
    </section>
  );
}
