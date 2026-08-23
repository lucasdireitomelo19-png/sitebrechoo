import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

const NAV_ITEMS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/rastreio", label: "Rastreio" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-line bg-white p-4 sm:block">
          <div className="mb-6 px-2">
            <p className="text-sm font-semibold text-espresso">Carcamana&apos;s Admin</p>
            <p className="truncate text-xs text-espresso-soft">{session.user.email}</p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-espresso-soft hover:bg-cream-dark hover:text-espresso"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-6 px-2">
            <button
              type="submit"
              className="text-sm font-medium text-espresso-soft hover:text-espresso"
            >
              Sair
            </button>
          </form>
          <Link
            href="/"
            className="mt-4 block px-2 text-sm text-espresso-soft hover:text-espresso"
          >
            ← Ver loja
          </Link>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:hidden">
            <p className="text-sm font-semibold">Carcamana&apos;s Admin</p>
            <form action={signOutAction}>
              <button type="submit" className="text-sm text-espresso-soft">
                Sair
              </button>
            </form>
          </header>
          <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
