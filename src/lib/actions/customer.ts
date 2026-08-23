"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function registerCustomer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    redirect("/minha-conta/cadastro?error=dados");
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    redirect("/minha-conta/cadastro?error=email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.customer.create({ data: { name, email, password: hashedPassword } });

  try {
    await signIn("customer", { email, password, redirectTo: "/minha-conta" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/minha-conta/login");
    }
    throw error;
  }
}
