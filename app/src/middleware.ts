import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIX,
  DEFAULT_LOGIN_REDIRECT,
  COOKIE_ACCESS_TOKEN,
} from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = pathname.startsWith(PROTECTED_ROUTE_PREFIX);
  const isApiRoute = pathname.startsWith("/api/");

  // Don't run middleware on API routes — they handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Check if token exists and is not obviously expired
  let hasValidToken = false;
  if (accessToken) {
    try {
      // Lightweight check — just decode and check expiration
      // Full cryptographic validation happens in Route Handlers
      const parts = accessToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf-8")
        );
        const exp = payload.exp as number;
        hasValidToken = exp > Date.now() / 1000;
      }
    } catch {
      hasValidToken = false;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && hasValidToken) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !hasValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
