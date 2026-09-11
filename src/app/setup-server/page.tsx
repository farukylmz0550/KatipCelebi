"use client";

import { useState } from "react";
import { Globe, ArrowRight } from "lucide-react";

export default function SetupServerPage() {
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let url = serverUrl.trim();
    if (!url) {
      setError("Server address required");
      return;
    }

    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      const parsed = new URL(url);
      // Save to localStorage for TWA
      localStorage.setItem("bookshelf-server", parsed.origin);
      // Redirect to the server's login page
      window.location.href = `${parsed.origin}/login`;
    } catch {
      setError("Invalid URL");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Globe size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Book Shelf</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your server address</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              autoComplete="url"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {"Running your own server? "}
          <a
            href="https://github.com/farukylmz0550/bookshelf-web"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener"
          >
            {"Set up on GitHub"}
          </a>
        </p>
      </div>
    </div>
  );
}
