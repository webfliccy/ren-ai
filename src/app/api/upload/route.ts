import { requireAdmin } from "@/lib/auth";
import { uploadToS3 } from "@/lib/storage";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file)
    return Response.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const url = await uploadToS3(buffer, file.name, file.type);
    return Response.json({
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    if (message.startsWith("File must have"))
      return Response.json({ error: message }, { status: 400 });
    return Response.json({ error: message }, { status: 502 });
  }
}
