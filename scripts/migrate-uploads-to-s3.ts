/**
 * One-time migration: upload all files in public/uploads/ to S3, then rewrite
 * stored /uploads/... URLs in the database to their full S3 equivalents.
 *
 * Idempotent: files already present in S3 under the correct key are skipped.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate-uploads-to-s3.ts
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fieldNotes, posts } from "../src/db/schema.js";
import type { Artefact } from "../src/db/schema.js";

// ── Environment validation ────────────────────────────────────────────────────

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET;
const dbUrl = process.env.TURSO_DATABASE_URL ?? "file:local.db";

if (!region || !accessKeyId || !secretAccessKey || !bucket) {
  console.error(
    "Missing required env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET"
  );
  process.exit(1);
}

const s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
const db = drizzle(createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN }));
const uploadsDir = path.join(process.cwd(), "public", "uploads");

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", svg: "image/svg+xml", pdf: "application/pdf",
  md: "text/markdown", txt: "text/plain", json: "application/json",
  py: "text/x-python", js: "text/javascript", ts: "text/typescript",
  csv: "text/csv", zip: "application/zip",
};

function contentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "application/octet-stream";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket!, Key: key }));
    return true;
  } catch (err: unknown) {
    // Only treat 404 as "not found" — re-throw auth errors, network errors, etc.
    const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    if (status === 404) return false;
    throw err;
  }
}

function s3Url(key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// ── Step 1: upload local files ────────────────────────────────────────────────

async function uploadLocalFiles(): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>(); // /uploads/filename → S3 URL
  let filenames: string[];
  try {
    const dirents = await readdir(uploadsDir, { withFileTypes: true });
    filenames = dirents.filter((d) => d.isFile()).map((d) => d.name);
  } catch {
    console.log("public/uploads/ does not exist or is empty — nothing to upload.");
    return urlMap;
  }

  for (const filename of filenames) {
    const key = `uploads/${filename}`;
    const localUrl = `/uploads/${filename}`;

    if (await objectExists(key)) {
      console.log(`  skip (already in S3): ${key}`);
      urlMap.set(localUrl, s3Url(key));
      continue;
    }

    const buffer = await readFile(path.join(uploadsDir, filename));
    const ct = contentType(filename);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket!,
        Key: key,
        Body: buffer,
        ContentType: ct,
        // No ACL — bucket must have a public-read bucket policy.
      })
    );

    console.log(`  uploaded: ${key}`);
    urlMap.set(localUrl, s3Url(key));
  }

  return urlMap;
}

// ── Step 2: rewrite DB URLs (artefacts + content in a single pass) ────────────

function rewriteContent(content: string, urlMap: Map<string, string>): string {
  let updated = content;
  for (const [local, s3url] of urlMap) {
    updated = updated.replaceAll(local, s3url);
  }
  return updated;
}

async function rewriteFieldNotes(urlMap: Map<string, string>): Promise<void> {
  const notes = await db
    .select({ id: fieldNotes.id, artefacts: fieldNotes.artefacts, content: fieldNotes.content })
    .from(fieldNotes);

  for (const note of notes) {
    const artefactList: Artefact[] = JSON.parse(note.artefacts || "[]");
    let artefactsChanged = false;

    for (const art of artefactList) {
      if (art.url.startsWith("/uploads/")) {
        const newUrl = urlMap.get(art.url);
        if (newUrl) {
          art.url = newUrl;
          artefactsChanged = true;
        } else {
          console.warn(`  WARNING: no S3 URL mapped for artefact ${art.url} (field note ${note.id})`);
        }
      }
    }

    const updatedContent = rewriteContent(note.content, urlMap);
    const contentChanged = updatedContent !== note.content;

    if (artefactsChanged || contentChanged) {
      await db
        .update(fieldNotes)
        .set({
          ...(artefactsChanged ? { artefacts: JSON.stringify(artefactList) } : {}),
          ...(contentChanged ? { content: updatedContent } : {}),
        })
        .where(eq(fieldNotes.id, note.id));
      console.log(`  updated field note ${note.id}`);
    }
  }
}

async function rewritePostContent(urlMap: Map<string, string>): Promise<void> {
  const allPosts = await db.select({ id: posts.id, content: posts.content }).from(posts);

  for (const post of allPosts) {
    const updated = rewriteContent(post.content, urlMap);
    if (updated !== post.content) {
      await db.update(posts).set({ content: updated }).where(eq(posts.id, post.id));
      console.log(`  updated content for post ${post.id}`);
    }
  }
}

// ── Step 3: link check ────────────────────────────────────────────────────────

async function linkCheck(urlMap: Map<string, string>): Promise<boolean> {
  let allOk = true;
  for (const s3url of urlMap.values()) {
    const res = await fetch(s3url, { method: "HEAD" });
    if (!res.ok) {
      console.error(`  BROKEN: ${s3url} → ${res.status}`);
      allOk = false;
    } else {
      console.log(`  ok: ${s3url}`);
    }
  }
  return allOk;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Step 1: uploading local files to S3…");
  const urlMap = await uploadLocalFiles();

  if (urlMap.size === 0) {
    console.log("No files to migrate.");
    return;
  }

  console.log(`\nStep 2: rewriting stored URLs…`);
  await rewriteFieldNotes(urlMap);
  await rewritePostContent(urlMap);

  console.log(`\nStep 3: link check…`);
  const ok = await linkCheck(urlMap);

  if (!ok) {
    console.error("\nMigration completed with broken links — check output above.");
    process.exit(1);
  }

  console.log("\nMigration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
