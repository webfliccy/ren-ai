import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  // Sanitize filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const filename = `${timestamp}_${safeName}`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return Response.json({
    url: `/uploads/${filename}`,
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
