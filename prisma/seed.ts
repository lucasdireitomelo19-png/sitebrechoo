import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@brecho.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "troque-esta-senha";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, name: adminName },
    create: {
      email: adminEmail,
      password: passwordHash,
      name: adminName,
      role: "ADMIN",
    },
  });
  console.log(`Admin pronto: ${adminEmail}`);

  const categoryNames = ["Feminino", "Masculino", "Acessorios", "Calcados", "Infantil"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );

  const byName = (name: string) => categories.find((c) => c.name === name)!;

  const products = [
    {
      title: "Vestido Floral Vintage",
      description: "Vestido midi floral, tecido leve, otimo estado. Peca unica de brecho.",
      priceCents: 8900,
      size: "M",
      brand: "Zara",
      condition: "LIKE_NEW" as const,
      category: byName("Feminino"),
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
    },
    {
      title: "Jaqueta Jeans Classica",
      description: "Jaqueta jeans unissex, lavagem media, marca registrada nas etiquetas.",
      priceCents: 12000,
      size: "G",
      brand: "Levi's",
      condition: "GOOD" as const,
      category: byName("Masculino"),
      images: ["https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800"],
    },
    {
      title: "Bolsa de Couro Marrom",
      description: "Bolsa de couro legitimo, alca ajustavel, poucos sinais de uso.",
      priceCents: 15000,
      size: "Unico",
      brand: "Schutz",
      condition: "GOOD" as const,
      category: byName("Acessorios"),
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"],
    },
    {
      title: "Tenis Casual Branco",
      description: "Tenis branco, solado em boas condicoes, ideal para o dia a dia.",
      priceCents: 9500,
      size: "39",
      brand: "Vans",
      condition: "FAIR" as const,
      category: byName("Calcados"),
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"],
    },
    {
      title: "Camisa Social Listrada",
      description: "Camisa social manga longa, tecido em otimo estado, sem manchas.",
      priceCents: 6500,
      size: "P",
      brand: "Aramis",
      condition: "LIKE_NEW" as const,
      category: byName("Masculino"),
      images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    },
    {
      title: "Macacao Infantil Colorido",
      description: "Macacao infantil, estampa divertida, tecido macio.",
      priceCents: 4500,
      size: "4 anos",
      brand: "Carter's",
      condition: "GOOD" as const,
      category: byName("Infantil"),
      images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800"],
    },
  ];

  for (const p of products) {
    const slug = slugify(`${p.title}-${p.brand ?? ""}`);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        slug,
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        size: p.size,
        brand: p.brand,
        condition: p.condition,
        status: "PUBLISHED",
        stock: 1,
        categoryId: p.category.id,
        images: {
          create: p.images.map((url, i) => ({ url, position: i })),
        },
      },
    });
  }

  console.log(`Seed concluido: ${products.length} produtos, ${categories.length} categorias.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
