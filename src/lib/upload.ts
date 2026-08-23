import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT_FROM_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * Salva a imagem enviada pelo admin.
 *
 * Na Vercel o sistema de arquivos é efêmero, então usamos o Vercel Blob
 * (ativo quando BLOB_READ_WRITE_TOKEN está definido — a Vercel injeta essa
 * variável automaticamente ao conectar um Blob Store ao projeto). Em
 * desenvolvimento local sem Blob configurado, caímos para salvar em
 * public/uploads.
 */
export async function saveUploadedImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Tipo de arquivo não suportado: ${file.type || "desconhecido"}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Imagem muito grande (máximo 5MB).");
  }

  const ext = EXT_FROM_TYPE[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return `/uploads/${filename}`;
}
