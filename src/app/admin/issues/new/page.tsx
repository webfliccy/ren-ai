import IssueForm from "@/components/IssueForm";

export const metadata = { title: "New issue — ren·ai" };

export default function NewIssuePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">New issue</h1>
      <IssueForm />
    </main>
  );
}
