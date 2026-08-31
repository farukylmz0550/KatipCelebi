"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser } from "@/app/actions/setup";

export default function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      await createAdminUser({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-xl font-semibold">First-time setup</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Create the admin account to get started.</p>
      <input
        name="name"
        placeholder="Admin name"
        required
        className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <input
        name="email"
        type="email"
        placeholder="Admin email"
        required
        className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <input
        name="password"
        type="password"
        placeholder="Admin password (min 8 chars)"
        required
        minLength={8}
        className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded bg-neutral-900 py-2 text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">
        {pending ? "…" : "Create admin account"}
      </button>
    </form>
  );
}
