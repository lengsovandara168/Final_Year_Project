import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, routing } from "@/i18n/routing";
import { resolveAuth, applyAuthCookies } from "@/lib/route-protection";
import {
  canAccessAdminSegment,
  getFirstStaffAdminPath,
} from "@/lib/rbac";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE = "en";
const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const i18nResponse = i18nMiddleware(request);

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = firstSegment
    ? (locales as readonly string[]).includes(firstSegment)
    : false;
  const activeLocale = hasLocale ? firstSegment : DEFAULT_LOCALE;
  const routeSegment = hasLocale ? segments[1] : segments[0];

  const auth = await resolveAuth(request);
  const role = auth.user?.role;
  const permissions = auth.user?.permissions;

  const withAuthCookies = (response: NextResponse) => {
    applyAuthCookies(response, auth);
    return response;
  };

  const redirectToRoleHome = () => {
    if (role === "admin") {
      return withAuthCookies(
        NextResponse.redirect(new URL(`/${activeLocale}/admin`, request.url)),
      );
    }

    if (role === "staff") {
      return withAuthCookies(
        NextResponse.redirect(
          new URL(getFirstStaffAdminPath(activeLocale, permissions), request.url),
        ),
      );
    }

    if (role === "user") {
      return withAuthCookies(
        NextResponse.redirect(new URL(`/${activeLocale}/users`, request.url)),
      );
    }

    return withAuthCookies(
      NextResponse.redirect(new URL(`/${activeLocale}/login`, request.url)),
    );
  };

  const publicRoutes = new Set(["login", "register", "verify-otp"]);
  if (publicRoutes.has(routeSegment ?? "")) {
    if (auth.isAuthenticated) {
      return redirectToRoleHome();
    }
    return withAuthCookies(i18nResponse);
  }

  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${activeLocale}/login`;
    loginUrl.searchParams.set("next", pathname);
    return withAuthCookies(NextResponse.redirect(loginUrl));
  };

  if (!auth.isAuthenticated) {
    return redirectToLogin();
  }

  if (pathname === `/${activeLocale}`) {
    return redirectToRoleHome();
  }

  const legacyAdminRoutes = new Set(["products", "orders", "customers"]);
  const isAdminRoute =
    routeSegment === "admin" || legacyAdminRoutes.has(routeSegment ?? "");
  const isUserRoute = routeSegment === "users" || routeSegment === "user";

  if (isAdminRoute && role !== "admin" && role !== "staff") {
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
    return withAuthCookies(response);
  }

  if (routeSegment === "admin" && role === "staff") {
    const adminChildSegment = segments[2];
    const hasAccess = canAccessAdminSegment(role, permissions, adminChildSegment);

    if (!hasAccess) {
      const destination = getFirstStaffAdminPath(activeLocale, permissions);
      const response = NextResponse.redirect(new URL(destination, request.url));
      response.cookies.set(
        "flash_toast",
        "Unauthorized: You do not have permission for this staff page.",
        {
          path: "/",
          maxAge: 10,
          sameSite: "lax",
        },
      );
      return withAuthCookies(response);
    }
  }

  if (isUserRoute && role !== "user") {
    const destination =
      role === "admin"
        ? `/${activeLocale}/admin`
        : role === "staff"
          ? getFirstStaffAdminPath(activeLocale, permissions)
          : `/${activeLocale}/login`;
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
    return withAuthCookies(response);
  }

  if (routeSegment === "user") {
    return withAuthCookies(
      NextResponse.redirect(new URL(`/${activeLocale}/users`, request.url)),
    );
  }

  if (
    legacyAdminRoutes.has(routeSegment ?? "") &&
    (role === "admin" || role === "staff")
  ) {
    return withAuthCookies(
      NextResponse.redirect(
        new URL(`/${activeLocale}/admin/${routeSegment}`, request.url),
      ),
    );
  }

  return withAuthCookies(i18nResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|.*\\..*).*)"],
};
