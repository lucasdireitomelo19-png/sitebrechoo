import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getDictionary, getLocale } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

// Este layout consulta o banco (categorias) para montar o menu e o rodapé.
// Sem isso, o Next.js tenta pré-gerar as páginas estáticas (carrinho,
// checkout) durante o build, quando o banco pode não estar acessível
// (ex: build isolado da rede privada na Railway).
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, t, locale] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar message={t.announcement.message} closeLabel={t.announcement.close} />
      <Header categories={categories} t={t} locale={locale} />
      <main className="flex-1">
        <Suspense fallback={children}>
          <PageTransition>
            <LocaleProvider locale={locale} t={t}>
              {children}
            </LocaleProvider>
          </PageTransition>
        </Suspense>
      </main>
      <Footer categories={categories} t={t} />
      <WhatsAppButton label={t.whatsapp.label} />
    </div>
  );
}
