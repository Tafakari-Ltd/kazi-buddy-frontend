// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value;


    const publicPaths = ["/auth/login", "/auth/register"];
    if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/employer/:path*", "/profile/:path*"], // protected routes
};
