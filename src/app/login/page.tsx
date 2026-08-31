"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setPending(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/books");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Log in</h1>
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="w-full rounded bg-neutral-900 py-2 text-white disabled:opacity-50">
          {pending ? "…" : "Log in"}
        </button>
        <p className="text-sm text-neutral-600">
          No account yet? <Link href="/register" className="underline">Create one</Link>
        </p>
      </form>
    </main>
  );
}
