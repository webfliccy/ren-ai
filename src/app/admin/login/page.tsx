"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect secret.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold text-gray-900">Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
