import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export const metadata = {
  title: "Entrar | Carcamana's",
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/minha-conta");

  try {
    await signIn("customer", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/minha-conta/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/minha-conta";

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">Minha conta</p>
        <h1 className="mt-1 font-extrabold text-3xl text-espresso">Entrar</h1>
        <p className="mt-2 text-sm text-espresso-soft">
          Acompanhe seus pedidos e o rastreio das suas compras.
        </p>

        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            E-mail ou senha inválidos.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
            placeholder="Senha"
            autoComplete="current-password"
            className="store-input"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-espresso px-4 py-3 text-sm font-medium text-cream transition hover:bg-sage"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm text-espresso-soft">
          Ainda não tem conta?{" "}
          <Link href="/minha-conta/cadastro" className="font-medium text-sage transition hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
