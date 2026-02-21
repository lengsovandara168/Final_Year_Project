import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
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
  const routeSegment = hasLocale ? segments[1] : segments[0];

  if (
    routeSegment === "login" ||
    routeSegment === "register" ||
    routeSegment === "verify-otp"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();
    const localePrefix = hasLocale ? `/${firstSegment}` : "";
    loginUrl.pathname = `${localePrefix}/login/email`;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
