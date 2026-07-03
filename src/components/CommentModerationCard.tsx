"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatters";

interface Props {
  id: number;
  authorName: string | null;
  postTitle: string | null;
  body: string;
  createdAt: Date | null;
}

export default function CommentModerationCard({ id, authorName, postTitle, body, createdAt }: Props) {
  const router = useRouter();

  async function approve() {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">
          {authorName ?? "Unknown"} on{" "}
          <span className="text-gray-500">{postTitle}</span>
        </span>
        {createdAt && (
          <time className="shrink-0 text-xs text-gray-400">
            {formatDate(new Date(createdAt))}
          </time>
        )}
      </div>
      <p className="mb-3 whitespace-pre-wrap text-sm text-gray-600">{body}</p>
      <div className="flex gap-2">
        <button
          onClick={approve}
          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={remove}
          className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
