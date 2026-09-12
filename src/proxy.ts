// SPDX-License-Identifier: GPL-3.0-only
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, throttlingEnabled, DEFAULT_LIMITS } from "@/lib/rate-limit";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/setup",
  "/manifest.json",
  "/sw.js",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.png",
  "/icon.svg",
  "/logo.svg",
  "/apple-touch-icon.png",
];

// NOTE: The limiter util holds a Map per runtime — proxy (middleware) and the
// Node server are separate runtimes, so each has its own instance. That is by
// design: the middleware guards /api/* (non-auth), while login/register
// throttling lives in the Node runtime (auth.ts authorize + server actions).
// NOTE: This in-memory rate limiter only works in single-instance deployments.
// In serverless, edge, or multi-replica setups, each instance has its own Map.
// For production at scale, replace with Redis-backed rate limiting (e.g. @upstash/ratelimit).

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Rate limit API routes (except auth — auth throttling lives in auth.ts
  // authorize() because the middleware runtime cannot load db/bcrypt).
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
    if (throttlingEnabled() && !checkRateLimit(`${ip}:${pathname}`, DEFAULT_LIMITS.api)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname.startsWith("/setup")) return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|api/register|_next/static|_next/image|favicon.ico).*)"],
};
