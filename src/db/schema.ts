import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── Issues ────────────────────────────────────────────────────────────────────

export const issues = sqliteTable("issue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

// ── Blog posts ────────────────────────────────────────────────────────────────

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id").references(() => issues.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  prompt: text("prompt"),
  figSvg: text("fig_svg"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  tags: text("tags").notNull().default("[]"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  tokens: text("tokens"),
  references: text("references").notNull().default("[]"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  readingTime: integer("reading_time").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// ── Tools & Contraptions (per issue) ─────────────────────────────────────────

export const tools = sqliteTable("tool", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  category: text("category").notNull().default(""),
  name: text("name").notNull(),
  illustration: text("illustration"),
  descriptor: text("descriptor").notNull().default(""),
  url: text("url"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;

// ── Resources (curated links, books, tools per issue) ─────────────────────────

export const resources = sqliteTable("resource", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url"),
  description: text("description"),
  type: text("type", { enum: ["link", "book", "tool", "quote", "other"] })
    .notNull()
    .default("link"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

// ── Auth.js tables (required by @auth/drizzle-adapter) ───────────────────────

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

export type User = typeof users.$inferSelect;

// ── Comments ──────────────────────────────────────────────────────────────────

export const comments = sqliteTable("comment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  fieldNoteId: integer("field_note_id").references(() => fieldNotes.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  parentId: integer("parent_id"),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Comment = typeof comments.$inferSelect;

// ── Static pages (about, etc.) ────────────────────────────────────────────────

export const sitePages = sqliteTable("site_page", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  tokens: text("tokens"),
  prompt: text("prompt"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type SitePage = typeof sitePages.$inferSelect;

// ── Subscribers ───────────────────────────────────────────────────────────────

export const subscribers = sqliteTable("subscriber", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  source: text("source").notNull().default("homepage"),
});

export type Subscriber = typeof subscribers.$inferSelect;

// ── Field Notes ───────────────────────────────────────────────────────────────

export const fieldNotes = sqliteTable("field_note", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id").references(() => issues.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  tags: text("tags").notNull().default("[]"),
  // Outcome
  outcomeStatus: text("outcome_status", {
    enum: ["pending", "success", "partial", "failure", "inconclusive"],
  }),
  outcomeDateClosed: integer("outcome_date_closed", { mode: "timestamp" }),
  outcomeRuns: integer("outcome_runs"),
  // Experimentation record (JSON: hypothesis, method, model, trials, duration, scoredBy, outcome)
  experiment: text("experiment").notNull().default("{}"),
  // Artefacts (JSON array: [{name, description, url, type, size}])
  artefacts: text("artefacts").notNull().default("[]"),
  // References (JSON array of Chicago web refs)
  references: text("references").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

export type FieldNote = typeof fieldNotes.$inferSelect;
export type NewFieldNote = typeof fieldNotes.$inferInsert;

export type ExperimentRecord = {
  hypothesis: string;
  method: string;
  model: string;
  trials: number | null;
  duration: string;
  scoredBy: string;
  outcome: string;
};

export type Artefact = {
  name: string;
  description: string;
  url: string;
  type: string;
  size: number | null;
};
