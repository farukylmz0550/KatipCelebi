"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-xl font-medium text-foreground">KatipCelebi</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          No account yet?{" "}
          <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
