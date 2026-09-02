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
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">KatipCelebi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create the admin account to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="editorial-label mb-1 block">Admin name</label>
              <input
                name="name"
                placeholder="Your name"
                required
                className="w-full border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="editorial-label mb-1 block">Admin email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="editorial-label mb-1 block">Admin password</label>
              <input
                name="password"
                type="password"
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-foreground py-2.5 text-xs font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Setting up..." : "Create admin account"}
          </button>
        </form>
      </div>
    </div>
  );
}
