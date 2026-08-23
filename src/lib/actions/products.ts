"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { saveUploadedImage } from "@/lib/upload";
import type { ProductCondition, ProductStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  if (!session?.user || userType !== "admin") {
    throw new Error("Não autorizado.");
  }
}

function parsePriceToCents(raw: string): number {
  const normalized = raw.replace(",", ".").trim();
  const value = Number(normalized);
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value * 100);
}

async function resolveCategoryId(categoryName: string): Promise<string | null> {
  const name = categoryName.trim();
  if (!name) return null;

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing.id;

  const created = await prisma.category.create({
    data: { name, slug: slugify(name) },
  });
  return created.id;
}

async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "produto";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parsePriceToCents(String(formData.get("price") ?? "0"));
  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPriceCents = compareAtPriceRaw ? parsePriceToCents(compareAtPriceRaw) : 0;
  const size = String(formData.get("size") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const condition = String(formData.get("condition") ?? "GOOD") as ProductCondition;
  const status = String(formData.get("status") ?? "PUBLISHED") as ProductStatus;
  const stock = Math.max(0, Number(formData.get("stock") ?? 1) || 0);
  const categoryName = String(formData.get("category") ?? "");

  if (!title || !description || priceCents <= 0) {
    throw new Error("Preencha título, descrição e preço válido.");
  }

  const slug = await uniqueSlug(title);
  const categoryId = await resolveCategoryId(categoryName);

  const files = formData.getAll("images").filter((f): f is File => f instanceof File);
  const imageUrls: string[] = [];
  for (const file of files) {
    const url = await saveUploadedImage(file);
    if (url) imageUrls.push(url);
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      priceCents,
      compareAtPriceCents: compareAtPriceCents > priceCents ? compareAtPriceCents : null,
      size,
      brand,
      condition,
      status,
      stock,
      slug,
      categoryId,
      images: { create: imageUrls.map((url, i) => ({ url, position: i })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Produto não encontrado.");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parsePriceToCents(String(formData.get("price") ?? "0"));
  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPriceCents = compareAtPriceRaw ? parsePriceToCents(compareAtPriceRaw) : 0;
  const size = String(formData.get("size") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const condition = String(formData.get("condition") ?? "GOOD") as ProductCondition;
  const status = String(formData.get("status") ?? "PUBLISHED") as ProductStatus;
  const stock = Math.max(0, Number(formData.get("stock") ?? 0) || 0);
  const categoryName = String(formData.get("category") ?? "");

  if (!title || !description || priceCents <= 0) {
    throw new Error("Preencha título, descrição e preço válido.");
  }

  const slug = title !== existing.title ? await uniqueSlug(title, id) : existing.slug;
  const categoryId = await resolveCategoryId(categoryName);

  const removeIds = formData.getAll("removeImage").map(String);
  if (removeIds.length > 0) {
    await prisma.productImage.deleteMany({ where: { id: { in: removeIds }, productId: id } });
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File);
  const imageUrls: string[] = [];
  for (const file of files) {
    const url = await saveUploadedImage(file);
    if (url) imageUrls.push(url);
  }

  const currentImageCount = await prisma.productImage.count({ where: { productId: id } });

  await prisma.product.update({
    where: { id },
    data: {
      title,
      description,
      priceCents,
      compareAtPriceCents: compareAtPriceCents > priceCents ? compareAtPriceCents : null,
      size,
      brand,
      condition,
      status,
      stock,
      slug,
      categoryId,
      images: {
        create: imageUrls.map((url, i) => ({ url, position: currentImageCount + i })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  revalidatePath(`/produto/${slug}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}
