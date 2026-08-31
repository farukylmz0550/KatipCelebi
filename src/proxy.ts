import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const isPublic = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));
  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api/auth|api/register|_next/static|_next/image|favicon.ico).*)"],
};
