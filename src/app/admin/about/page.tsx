import AboutForm from "@/components/AboutForm";
import { db } from "@/db";
import { sitePages } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Edit About — ren·ai" };

export default async function AdminAboutPage() {
  const [page] = await db.select().from(sitePages).where(eq(sitePages.key, "about"));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
          ← Admin
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">About the Fan</h1>
      </div>
      <AboutForm
        initialTitle={page?.title ?? "About the Fan"}
        initialContent={page?.content ?? ""}
        initialTokens={page?.tokens ?? ""}
        initialPrompt={page?.prompt ?? ""}
      />
    </main>
  );
}
