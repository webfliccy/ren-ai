import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { createTestDb } from "@/test/db";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

const container = vi.hoisted(() => ({
  db: null as LibSQLDatabase<typeof schema> | null,
}));

vi.mock("@/db", () => ({
  get db() {
    return container.db;
  },
}));

import {
  getPublishedPosts,
  getPostWithComments,
  getPostById,
  createPost,
  updatePost,
} from "@/services/posts";

let cleanup: () => void;

beforeAll(async () => {
  const result = await createTestDb();
  container.db = result.db;
  cleanup = result.cleanup;
});

afterAll(() => cleanup?.());

async function insertPost(
  overrides: Partial<typeof schema.posts.$inferInsert> = {},
) {
  const [post] = await container
    .db!.insert(schema.posts)
    .values({
      title: "Test Post",
      slug: `test-post-${Math.random().toString(36).slice(2)}`,
      content: "word ".repeat(200),
      status: "published",
      tags: JSON.stringify(["ai", "tech"]),
      references: "[]",
      readingTime: 1,
      ...overrides,
    })
    .returning();
  return post;
}

describe("getPublishedPosts", () => {
  test("excludes draft posts", async () => {
    const published = await insertPost({ status: "published" });
    const draft = await insertPost({ status: "draft" });

    const results = await getPublishedPosts();
    const ids = results.map((p) => p.id);
    expect(ids).toContain(published.id);
    expect(ids).not.toContain(draft.id);
  });

  test("includes all posts when all=true", async () => {
    const published = await insertPost({ status: "published" });
    const draft = await insertPost({ status: "draft" });

    const results = await getPublishedPosts({ all: true });
    const ids = results.map((p) => p.id);
    expect(ids).toContain(published.id);
    expect(ids).toContain(draft.id);
  });

  test("filters by tag", async () => {
    const matched = await insertPost({
      tags: JSON.stringify(["rare-tag-xyz"]),
    });
    const unmatched = await insertPost({ tags: JSON.stringify(["other"]) });

    const results = await getPublishedPosts({ tag: "rare-tag-xyz" });
    const ids = results.map((p) => p.id);
    expect(ids).toContain(matched.id);
    expect(ids).not.toContain(unmatched.id);
  });
});

describe("getPostWithComments", () => {
  test("returns null for draft posts", async () => {
    const post = await insertPost({ status: "draft" });
    const result = await getPostWithComments(post.slug);
    expect(result).toBeNull();
  });

  test("returns null for unknown slug", async () => {
    const result = await getPostWithComments("slug-that-does-not-exist");
    expect(result).toBeNull();
  });

  test("returns post and empty comments array for published post", async () => {
    const post = await insertPost({ status: "published" });
    const result = await getPostWithComments(post.slug);
    expect(result).not.toBeNull();
    expect(result!.post.id).toBe(post.id);
    expect(Array.isArray(result!.comments)).toBe(true);
  });
});

describe("createPost", () => {
  test("sets publishedAt when status is published", async () => {
    const post = await createPost({
      title: "Published Article",
      status: "published",
    });
    expect(post.publishedAt).not.toBeNull();
  });

  test("leaves publishedAt null for drafts", async () => {
    const post = await createPost({ title: "Draft Article", status: "draft" });
    expect(post.publishedAt).toBeNull();
  });

  test("generates a slug from the title", async () => {
    const post = await createPost({ title: "My Brand New Article" });
    expect(post.slug).toBe("my-brand-new-article");
  });

  test("round-trips tags as a JSON array", async () => {
    const created = await createPost({
      title: "Tagged Article",
      tags: ["foo", "bar"],
    });
    const fetched = await getPostById(created.id);
    expect(fetched).not.toBeNull();
    expect(JSON.parse(fetched!.tags)).toEqual(["foo", "bar"]);
  });
});

describe("updatePost", () => {
  test("does not overwrite publishedAt on re-publish", async () => {
    const post = await createPost({
      title: "Stable Date",
      status: "published",
    });
    const original = post.publishedAt!.getTime();

    await new Promise((r) => setTimeout(r, 50));

    const updated = await updatePost(post.id, {
      title: post.title,
      status: "published",
      tags: [],
    });

    expect(updated!.publishedAt!.getTime()).toBe(original);
  });

  test("sets publishedAt when transitioning draft → published", async () => {
    const post = await createPost({ title: "Goes Live", status: "draft" });
    expect(post.publishedAt).toBeNull();

    const updated = await updatePost(post.id, {
      title: post.title,
      status: "published",
      tags: [],
    });
    expect(updated!.publishedAt).not.toBeNull();
  });

  test("returns null for a non-existent post", async () => {
    const result = await updatePost(999999, { title: "Ghost", tags: [] });
    expect(result).toBeNull();
  });
});

describe("hindsight", () => {
  test("adding hindsight stamps hindsightAddedAt without touching publishedAt", async () => {
    const post = await createPost({
      title: "Amended Later",
      status: "published",
    });
    const originalPublished = post.publishedAt!.getTime();
    expect(post.hindsightAddedAt).toBeNull();

    const updated = await updatePost(post.id, {
      title: post.title,
      status: "published",
      tags: [],
      hindsight: "A reader pointed out an earlier source.",
    });

    expect(updated!.hindsight).toBe("A reader pointed out an earlier source.");
    expect(updated!.hindsightAddedAt).not.toBeNull();
    expect(updated!.publishedAt!.getTime()).toBe(originalPublished);
  });

  test("keeps the original hindsightAddedAt on later edits", async () => {
    const post = await createPost({
      title: "Stable Amendment",
      hindsight: "First note.",
    });
    const stamped = post.hindsightAddedAt!.getTime();

    await new Promise((r) => setTimeout(r, 50));

    const updated = await updatePost(post.id, {
      title: post.title,
      tags: [],
      hindsight: "First note, reworded.",
    });
    expect(updated!.hindsightAddedAt!.getTime()).toBe(stamped);
  });

  test("respects an explicit hindsightAddedAt date", async () => {
    const post = await createPost({
      title: "Backdated Amendment",
      hindsight: "Note.",
      hindsightAddedAt: "2026-07-02",
    });
    expect(post.hindsightAddedAt!.toISOString().slice(0, 10)).toBe(
      "2026-07-02",
    );
  });

  test("clearing hindsight clears hindsightAddedAt", async () => {
    const post = await createPost({
      title: "Retracted Amendment",
      hindsight: "Oops.",
    });
    const updated = await updatePost(post.id, {
      title: post.title,
      tags: [],
      hindsight: "",
    });
    expect(updated!.hindsight).toBe("");
    expect(updated!.hindsightAddedAt).toBeNull();
  });
});
