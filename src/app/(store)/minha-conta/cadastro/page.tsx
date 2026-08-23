import Link from "next/link";
import { registerCustomer } from "@/lib/actions/customer";

export const metadata = {
  title: "Criar conta | Carcamana's",
};

const ERROR_MESSAGES: Record<string, string> = {
  email: "Este e-mail já está cadastrado. Tente entrar.",
  dados: "Preencha todos os campos. A senha precisa ter ao menos 6 caracteres.",
};

export default async function CustomerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">Minha conta</p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">Criar conta</h1>
        <p className="mt-2 text-sm text-espresso-soft">
          Crie sua conta para acompanhar seus pedidos e o rastreio das suas compras.
        </p>

        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[params.error] ?? "Não foi possível criar sua conta."}
          </p>
        )}

        <form action={registerCustomer} className="mt-6 space-y-3">
          <input
            name="name"
            required
            placeholder="Nome completo"
            autoComplete="name"
            className="store-input"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            autoComplete="email"
            className="store-input"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Senha (mín. 6 caracteres)"
            autoComplete="new-password"
            className="store-input"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-espresso px-4 py-3 text-sm font-medium text-cream transition hover:bg-sage"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-sm text-espresso-soft">
          Já tem conta?{" "}
          <Link href="/minha-conta/login" className="font-medium text-sage transition hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
