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
    const response = NextResponse.redirect(loginUrl);
    applyAuthCookies(response, auth);
    return response;
  };

  const redirectToRefreshSession = () => {
    const response = NextResponse.redirect(
      new URL(`/api/auth/refresh-session?next=${encodeURIComponent(pathname)}`, request.url),
    );
    applyAuthCookies(response, auth);
    return response;
  };

  // 5. Redirect locale root to role-aware destination
  if (pathname === `/${activeLocale}`) {
    if (!auth.isAuthenticated) {
      if (auth.requiresRefresh) {
        return redirectToRefreshSession();
      }
      return redirectToLogin();
    }

    if (role === "admin") {
      const response = NextResponse.redirect(
        new URL(`/${activeLocale}/admin`, request.url),
      );
      applyAuthCookies(response, auth);
      return response;
    }

    if (role === "user") {
      const response = NextResponse.redirect(
        new URL(`/${activeLocale}/users`, request.url),
      );
      applyAuthCookies(response, auth);
      return response;
    }

    return redirectToLogin();
  }

  // 6. All protected routes require authentication
  if (!auth.isAuthenticated) {
    if (auth.requiresRefresh) {
      return redirectToRefreshSession();
    }
    return redirectToLogin();
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
