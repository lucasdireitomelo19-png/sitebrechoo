import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar message="Peças novas toda semana ✨ Confira as novidades" />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
