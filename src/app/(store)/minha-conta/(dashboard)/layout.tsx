import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getDictionary, format } from "@/lib/i18n";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;

  if (!session?.user || userType !== "customer") {
    redirect("/minha-conta/login");
  }

  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">
              {t.account.eyebrow}
            </p>
            <h1 className="mt-1 font-extrabold text-2xl text-espresso">
              {format(t.account.greeting, { name: session.user.name ?? "" })}
            </h1>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-espresso-soft transition hover:text-sage"
            >
              {t.account.signOut}
            </button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
