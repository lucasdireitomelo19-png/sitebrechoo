import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveUploadedImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Tipo de arquivo não suportado: ${file.type || "desconhecido"}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Imagem muito grande (máximo 5MB).");
  }

  const extFromType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  const ext = extFromType[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return `/uploads/${filename}`;
}
