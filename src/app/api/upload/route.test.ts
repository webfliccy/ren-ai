import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/storage", () => ({
  uploadToS3: vi.fn().mockResolvedValue(
    "https://test-bucket.s3.us-east-1.amazonaws.com/uploads/123_photo.jpg"
  ),
}));

import { POST } from "@/app/api/upload/route";
import { uploadToS3 } from "@/lib/storage";

const mockedUploadToS3 = vi.mocked(uploadToS3);

const FAKE_S3_URL = "https://test-bucket.s3.us-east-1.amazonaws.com/uploads/123_photo.jpg";

function makeRequest(file?: File): NextRequest {
  const form = new FormData();
  if (file) form.append("file", file);
  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: form,
  }) as unknown as NextRequest;
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    mockedUploadToS3.mockResolvedValue(FAKE_S3_URL);
  });

  it("returns 400 when no file is provided", async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(400);
  });

  it("returns { url, name, type, size } with an https:// S3 URL", async () => {
    const fileContent = new Uint8Array([137, 80, 78, 71]);
    const file = new File([fileContent], "photo.jpg", { type: "image/jpeg" });

    const response = await POST(makeRequest(file));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      url: expect.stringMatching(/^https:\/\//),
      name: "photo.jpg",
      type: "image/jpeg",
      size: fileContent.byteLength,
    });
  });

  it("url is not a relative /uploads/ path", async () => {
    const file = new File(["data"], "test.png", { type: "image/png" });

    const response = await POST(makeRequest(file));
    const data = await response.json();

    expect(data.url).not.toMatch(/^\/uploads\//);
  });
});
