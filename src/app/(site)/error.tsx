"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200">Error</h1>
      <p className="mt-4 text-lg text-gray-500">Something went wrong.</p>
      <button
        onClick={() => unstable_retry()}
        className="mt-6 text-sm text-blue-600 hover:underline"
      >
        Try again
      </button>
      <Link href="/" className="mt-2 text-sm text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </main>
  );
}
