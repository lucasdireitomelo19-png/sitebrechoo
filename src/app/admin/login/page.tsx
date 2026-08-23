import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export const metadata = {
  title: "Login admin | Brechó",
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-stone-900">Área administrativa</h1>
        <p className="mb-6 text-sm text-stone-500">Entre com suas credenciais de administrador.</p>

        {params.error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            E-mail ou senha inválidos.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
