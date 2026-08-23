import Link from "next/link";
import { registerCustomer } from "@/lib/actions/customer";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Criar conta | Carcamana's",
};

export default async function CustomerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, t] = await Promise.all([searchParams, getDictionary()]);

  const ERROR_MESSAGES: Record<string, string> = {
    email: t.account.errorEmailTaken,
    dados: t.account.errorInvalidData,
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">
          {t.account.eyebrow}
        </p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">{t.account.createAccount}</h1>
        <p className="mt-2 text-sm text-espresso-soft">{t.account.createAccountSubtitle}</p>

        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[params.error] ?? t.account.errorGeneric}
          </p>
        )}

        <form action={registerCustomer} className="mt-6 space-y-3">
          <input
            name="name"
            required
            placeholder={t.account.fullName}
            autoComplete="name"
            className="store-input"
          />
          <input
            name="email"
            type="email"
            required
            placeholder={t.account.email}
            autoComplete="email"
            className="store-input"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder={t.account.passwordHint}
            autoComplete="new-password"
            className="store-input"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-espresso px-4 py-3 text-sm font-medium text-cream transition hover:bg-sage"
          >
            {t.account.createAccount}
          </button>
        </form>

        <p className="mt-6 text-sm text-espresso-soft">
          {t.account.hasAccount}{" "}
          <Link href="/minha-conta/login" className="font-medium text-sage transition hover:underline">
            {t.account.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
