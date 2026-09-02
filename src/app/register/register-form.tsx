"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const result = await registerUser({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-xl font-medium text-foreground">KatipCelebi</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Name</label>
            <input
              name="name"
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
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
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
