import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, "O carrinho está vazio."),
  customer: z.object({
    name: z.string().min(2, "Informe seu nome completo."),
    email: z.string().email("E-mail inválido."),
    phone: z.string().min(8, "Informe um telefone válido.").optional().or(z.literal("")),
    taxId: z
      .string()
      .min(11, "CPF inválido.")
      .max(14, "CPF inválido.")
      .optional()
      .or(z.literal("")),
  }),
  shipping: z
    .object({
      street: z.string().min(2),
      number: z.string().min(1),
      complement: z.string().optional().or(z.literal("")),
      city: z.string().min(2),
      state: z.string().length(2),
      zip: z.string().min(8),
    })
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
