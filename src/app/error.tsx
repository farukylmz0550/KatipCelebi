// SPDX-License-Identifier: GPL-3.0-only
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded bg-foreground px-4 py-2 text-sm text-background hover:bg-muted-foreground"
      >
        Try again
      </button>
    </div>
  );
}
