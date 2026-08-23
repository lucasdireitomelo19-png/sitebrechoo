import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Política de troca | Carcamana's",
};

export default async function PoliticaDeTrocaPage() {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">
          {t.footer.institutional}
        </p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">{t.institutional.policyTitle}</h1>

        <p className="mt-6 text-sm leading-relaxed text-espresso-soft">
          {t.institutional.policyIntro}
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.deadlineTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.deadlineText}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.conditionTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.conditionText}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.howToTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.howToText}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.refundTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.refundText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
