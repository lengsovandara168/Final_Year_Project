import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE = "en"; // Ensure this matches your project config

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle the absolute root "/"
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  // 2. Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 3. Determine Locale
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = (locales as readonly string[]).includes(firstSegment);

  // Use existing locale or fallback to default
  const activeLocale = hasLocale ? firstSegment : DEFAULT_LOCALE;
  const routeSegment = hasLocale ? segments[1] : segments[0];

  // 4. Public Routes (Always accessible)
  if (
    routeSegment === "login" ||
    routeSegment === "register" ||
    routeSegment === "verify-otp"
  ) {
    return NextResponse.next();
  }

  // 5. Protected Routes & Authentication
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();

    // FIX: Always include the locale prefix in the redirect path
    loginUrl.pathname = `/${activeLocale}/login/email`;
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Optimized matcher to exclude more static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
