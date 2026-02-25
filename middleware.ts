import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/i18n/routing";
import {
  applyAuthCookies,
  resolveAuth,
} from "@/lib/route-protection";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE = "en"; // Default for your AUPP project

export async function middleware(request: NextRequest) {
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

  // Resolve auth once for root/default decisions
  const auth = await resolveAuth(request);
  const role = auth.user?.role;
  const legacyAdminRoutes = new Set(["products", "orders", "customers"]);
  const isAdminRoute = routeSegment === "admin" || legacyAdminRoutes.has(routeSegment);
  const isUserRoute = routeSegment === "users" || routeSegment === "user";

  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${activeLocale}/login`;
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    applyAuthCookies(response, auth);
    return response;
  };

  // 5. Redirect locale root to role-aware destination
  if (pathname === `/${activeLocale}`) {
    if (!auth.isAuthenticated) {
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
    return redirectToLogin();
  }

  // 7. Role-specific authorization
  if (isAdminRoute && role !== "admin") {
    const destination =
      role === "user" ? `/${activeLocale}/users` : `/${activeLocale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(
      "flash_toast",
      "Unauthorized: You do not have permission to access admin pages.",
      {
        path: "/",
        maxAge: 10,
        sameSite: "lax",
      },
    );
    applyAuthCookies(response, auth);
    return response;
  }

  if (isUserRoute && role !== "user") {
    const destination =
      role === "admin" ? `/${activeLocale}/admin` : `/${activeLocale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(
      "flash_toast",
      "Unauthorized: You do not have permission to access user pages.",
      {
        path: "/",
        maxAge: 10,
        sameSite: "lax",
      },
    );
    applyAuthCookies(response, auth);
    return response;
  }

  // 8. Normalize singular user route
  if (routeSegment === "user") {
    const response = NextResponse.redirect(
      new URL(`/${activeLocale}/users`, request.url),
    );
    applyAuthCookies(response, auth);
    return response;
  }

  // 9. Legacy admin route redirects
  if (legacyAdminRoutes.has(routeSegment) && role === "admin") {
    const response = NextResponse.redirect(
      new URL(`/${activeLocale}/admin/${routeSegment}`, request.url),
    );
    applyAuthCookies(response, auth);
    return response;
  }

  // 10. Allow authorized request
  const response = NextResponse.next();
  applyAuthCookies(response, auth);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
