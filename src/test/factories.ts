import { randomUUID } from "crypto";
import type { NewPost } from "@/db/schema";

// Shared between Vitest and the Playwright seed: the one definition of what a
// schema-valid post looks like. Tests pass overrides for only what they assert.
export function makePost(overrides: Partial<NewPost> = {}): NewPost {
  const status = overrides.status ?? "published";
  return {
    title: "Test Post",
    slug: `test-post-${randomUUID().slice(0, 8)}`,
    content: "word ".repeat(200),
    status,
    tags: JSON.stringify(["ai", "tech"]),
    references: "[]",
    readingTime: 1,
    publishedAt: status === "published" ? new Date() : null,
    ...overrides,
  };
}

// A post exercising the markdown surface the public renderer must handle:
// heading, link in running text, and a list.
export function makeRichPost(overrides: Partial<NewPost> = {}): NewPost {
  return makePost({
    title: "Field Notes on Mechanical Minds",
    excerpt: "Babbage, gears, and the first stirrings of machine memory.",
    content: [
      "## The Difference Engine",
      "",
      "Charles Babbage never finished his machine, but the [plans survive](https://example.com/babbage) in remarkable detail.",
      "",
      "- Gears as memory",
      "- Cards as programs",
    ].join("\n"),
    tags: JSON.stringify(["history", "machines"]),
    readingTime: 3,
    ...overrides,
  });
}
