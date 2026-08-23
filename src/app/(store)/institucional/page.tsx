export const metadata = {
  title: "Institucional | Carcamana's",
};

export default function InstitucionalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">Institucional</p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">Sobre a Carcamana&apos;s</h1>

        <p className="mt-6 text-sm leading-relaxed text-espresso-soft">
          A Carcamana&apos;s nasceu da vontade de dar uma nova vida a peças que ainda têm muita
          história pra contar. Acreditamos que moda boa não precisa ser nova — precisa ser bem
          escolhida. Por isso, cada item que chega até você passa por uma curadoria cuidadosa,
          selecionado pela qualidade, pelo estado de conservação e pelo estilo.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-espresso">Moda circular</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Cada peça revendida é uma peça a menos indo parar no descarte. Consumir de segunda
              mão é um jeito simples de fazer diferença.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-espresso">Curadoria de verdade</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Não vendemos qualquer coisa. Cada item é avaliado individualmente antes de entrar
              no catálogo, com a condição descrita de forma honesta.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-espresso">Peças únicas</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Trabalhamos com unidade por peça — quando ela vende, não tem reposição igual. Cada
              compra é, literalmente, uma peça única.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-espresso-soft">
          Tem alguma dúvida sobre uma peça ou sobre como compramos? Fala com a gente — os links de
          contato estão no rodapé do site.
        </p>
      </div>
    </div>
  );
}
