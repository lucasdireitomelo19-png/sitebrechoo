export const metadata = {
  title: "Política de troca | Carcamana's",
};

export default function PoliticaDeTrocaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">Institucional</p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">Política de troca e devolução</h1>

        <p className="mt-6 text-sm leading-relaxed text-espresso-soft">
          Como cada peça do nosso brechó é única, pedimos atenção redobrada às fotos, medidas e à
          descrição do estado de conservação antes da compra. Ainda assim, você tem direito à
          troca ou devolução nas condições abaixo.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-espresso">Prazo</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Você pode solicitar a troca ou devolução em até 7 dias corridos após o recebimento
              do pedido, conforme o Código de Defesa do Consumidor para compras feitas fora do
              estabelecimento físico.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">Condições da peça</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              A peça precisa ser devolvida sem uso adicional, nas mesmas condições em que foi
              enviada. Como trabalhamos com roupas de segunda mão, pequenas marcas de uso já
              descritas no anúncio não são motivo de devolução.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">Como solicitar</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Entre em contato pelo WhatsApp ou e-mail informando o número do pedido (disponível
              na página de status da sua compra) e o motivo da troca ou devolução. A gente
              combina o envio de volta com você.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">Reembolso</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              Após recebermos e conferirmos a peça devolvida, o reembolso é feito pela mesma forma
              de pagamento usada na compra, em até 10 dias úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
