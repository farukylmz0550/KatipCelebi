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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-xl font-medium text-foreground">KatipCelebi</h1>
        <p className="mb-8 text-center text-[13px] text-muted-foreground">Create the admin account to get started.</p>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Admin name</label>
            <input
              name="name"
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Admin email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Admin password</label>
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
            {pending ? "Setting up..." : "Create admin account"}
          </button>
        </form>
      </div>
    </div>
  );
}
