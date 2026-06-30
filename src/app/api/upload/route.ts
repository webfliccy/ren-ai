import { requireAdmin } from "@/lib/auth";
import { uploadToS3 } from "@/lib/storage";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const key = `uploads/${timestamp}_${safeName}`;

  const url = await uploadToS3(buffer, key, file.type);

  return Response.json({
    url,
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
