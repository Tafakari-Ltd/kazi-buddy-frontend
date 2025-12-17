import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const publicPaths = ["/auth/login", "/auth/register", "/auth/signup", "/auth/verify-email", "/auth/forgot", "/"];

  // Allow static assets and public paths
  if (
    publicPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
    req.nextUrl.pathname.includes(".") 
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("returnTo", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/employer/:path*", 
    "/profile/:path*",
    "/worker/:path*",
    "/jobs/users/:path*"
  ],
};