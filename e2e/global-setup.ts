import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "fs";
import path from "path";
import { posts } from "@/db/schema";
import { E2E_DB_PATH } from "./env";
import { SEED_POSTS } from "./fixtures";

// Resets rows rather than deleting the database file: with
// reuseExistingServer a running `next start` holds the file open, and
// unlinking it under the server would leave tests reading a stale inode.
export default async function globalSetup() {
  fs.mkdirSync(path.dirname(E2E_DB_PATH), { recursive: true });

  const client = createClient({ url: `file:${E2E_DB_PATH}` });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../drizzle"),
  });

  await db.transaction(async (tx) => {
    await tx.delete(posts);
    await tx.insert(posts).values(SEED_POSTS);
  });

  client.close();
}

// Playwright's `globalSetup` config hook runs after `webServer.command`
// starts, but `next build` (part of that command) queries the database
// while building — so webServer.command invokes this file directly via tsx
// instead of registering it as globalSetup, which would reseed a second
// time on every run for no benefit.
if (require.main === module) {
  globalSetup().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
