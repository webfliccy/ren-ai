import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="mt-4 text-lg text-gray-500">
        This page doesn&apos;t exist.
      </p>
      <Link href="/" className="mt-6 text-sm text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </main>
  );
}
