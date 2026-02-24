import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE = "en"; // Default for your AUPP project

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect absolute root "/" to "/en"
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  // 2. Skip middleware for static assets, API routes, and internal Next files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 3. Extract locale and current route
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = (locales as readonly string[]).includes(firstSegment);

  const activeLocale = hasLocale ? firstSegment : DEFAULT_LOCALE;
  const routeSegment = hasLocale ? segments[1] : segments[0];

  // 4. Allow public access to auth pages
  const publicRoutes = ["login", "register", "verify-otp"];
  if (publicRoutes.includes(routeSegment)) {
    return NextResponse.next();
  }

  // 5. Protected Route Logic
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();
    // Always prefix with locale so Vercel finds the page
    loginUrl.pathname = `/${activeLocale}/login`;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
