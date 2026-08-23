import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Institucional | Carcamana's",
};

export default async function InstitucionalPage() {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">
          {t.footer.institutional}
        </p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">{t.institutional.aboutTitle}</h1>

        <p className="mt-6 text-sm leading-relaxed text-espresso-soft">{t.institutional.aboutIntro}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.circularTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.circularText}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.curationTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.curationText}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-espresso">{t.institutional.uniqueTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">
              {t.institutional.uniqueText}
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-espresso-soft">
          {t.institutional.aboutClosing}
        </p>
      </div>
    </div>
  );
}
