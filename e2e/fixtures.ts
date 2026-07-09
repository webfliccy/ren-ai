import { makePost, makeRichPost } from "@/test/factories";

// Slugs and dates are pinned (not factory-randomised) because the specs run in
// a different process from the seed and must agree on them. publishedAt dates
// order the home page deterministically: the rich post is the lead.
export const RICH_POST = makeRichPost({
  slug: "field-notes-on-mechanical-minds",
  publishedAt: new Date("2026-01-03"),
});

export const SEED_POSTS = [
  RICH_POST,
  makePost({
    title: "A Second Dispatch",
    slug: "a-second-dispatch",
    publishedAt: new Date("2026-01-02"),
  }),
  makePost({
    title: "A Third Dispatch",
    slug: "a-third-dispatch",
    publishedAt: new Date("2026-01-01"),
  }),
];
