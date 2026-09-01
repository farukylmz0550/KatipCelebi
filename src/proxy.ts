import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/setup", "/api/test"];

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  const isSetup = pathname.startsWith("/setup");
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Lightweight setup check without importing Prisma in middleware: rely on setup page self-redirect.
  // The auth callback below handles unauthenticated redirect; setup is public to allow first admin.
  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users should not visit setup; unauthenticated hitting login/register when setup needed
  // is handled by /setup page redirect — middleware keeps /setup public.
  if (isSetup) return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|api/register|api/test|_next/static|_next/image|favicon.ico).*)"],
};
