import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Este layout consulta o banco (categorias) para montar o menu e o rodapé.
// Sem isso, o Next.js tenta pré-gerar as páginas estáticas (carrinho,
// checkout) durante o build, quando o banco pode não estar acessível
// (ex: build isolado da rede privada na Railway).
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar message="Peças novas toda semana ✨ Confira as novidades" />
      <Header categories={categories} />
      <main className="flex-1">
        <Suspense fallback={children}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </main>
      <Footer categories={categories} />
      <WhatsAppButton />
    </div>
  );
}
