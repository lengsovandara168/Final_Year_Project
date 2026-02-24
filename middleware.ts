import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { resolveAuth, applyAuthCookies } from "@/lib/route-protection";

// 1. Create the next-intl middleware
const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Handle i18n routing first (adds /en or /km if missing)
  const response = i18nMiddleware(request);

  // 3. Skip Auth logic for public files/API
  if (pathname.includes(".") || pathname.startsWith("/api")) {
    return response;
  }

  // 4. Resolve Authentication
  const auth = await resolveAuth(request);
  const segments = pathname.split("/").filter(Boolean);
  const activeLocale = segments[0] || "en";
  const routeSegment = segments[1] || "";

  const publicRoutes = ["login", "register", "verify-otp"];

  // 5. Auth Guard Logic
  if (!auth.isAuthenticated && !publicRoutes.includes(routeSegment)) {
    const loginUrl = new URL(`/${activeLocale}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Role-based Redirection
  if (pathname === `/${activeLocale}` && auth.isAuthenticated) {
    const dest = auth.user?.role === "admin" ? "/admin" : "/users";
    return NextResponse.redirect(
      new URL(`/${activeLocale}${dest}`, request.url),
    );
  }

  // Always apply auth cookies to the response to keep session fresh
  applyAuthCookies(response, auth);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
