import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/setup", "/manifest.json", "/sw.js", "/icon-192.png", "/icon-512.png"];

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Rate limit API routes (except auth)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
    if (!checkRateLimit(`${ip}:${pathname}`)) {
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
