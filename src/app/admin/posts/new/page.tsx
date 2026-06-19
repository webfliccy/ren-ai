import PostForm from "@/components/PostForm";

export const metadata = { title: "New post — ren·ai" };

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">New post</h1>
      <PostForm />
    </main>
  );
}
