import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

type ResolveAuthResult = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  nextAccessToken?: string;
  shouldClearAuthCookies?: boolean;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parseAuthUser(rawUser: string | undefined) {
  if (!rawUser) {
    return null;
  }

  const tryParse = (value: string) => {
    try {
      const parsed = JSON.parse(value) as Partial<AuthUser>;
      if (
        typeof parsed.id === "string" &&
        typeof parsed.email === "string" &&
        typeof parsed.role === "string"
      ) {
        return {
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
        } satisfies AuthUser;
      }
    } catch {
      return null;
    }
    return null;
  };

  const direct = tryParse(rawUser);
  if (direct) {
    return direct;
  }

  try {
    return tryParse(decodeURIComponent(rawUser));
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest, locale: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${locale}/login`;
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function applyAuthCookies(
  response: NextResponse,
  result: Pick<
    ResolveAuthResult,
    "nextAccessToken" | "user" | "shouldClearAuthCookies"
  >,
) {
  if (result.shouldClearAuthCookies) {
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return;
  }

  if (result.nextAccessToken) {
    response.cookies.set("access_token", result.nextAccessToken, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  }

  if (result.user) {
    response.cookies.set("auth_user", JSON.stringify(result.user), {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  }
}

export async function resolveAuth(request: NextRequest): Promise<ResolveAuthResult> {
  const accessToken = request.cookies.get("access_token")?.value;
  const authUser = parseAuthUser(request.cookies.get("auth_user")?.value);

  // Fast path for middleware performance: trust existing auth cookies.
  // Token validity is enforced by backend APIs on protected endpoints.
  if (accessToken && authUser) {
    return {
      isAuthenticated: true,
      user: authUser,
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    shouldClearAuthCookies: true,
  };
}

export async function requireAdmin(request: NextRequest, locale: string) {
  const auth = await resolveAuth(request);
  if (!auth.isAuthenticated) {
    const response = redirectToLogin(request, locale);
    applyAuthCookies(response, auth);
    return response;
  }

  if (auth.user?.role !== "admin") {
    const destination = auth.user?.role === "user" ? `/${locale}/users` : `/${locale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    applyAuthCookies(response, auth);
    return response;
  }

  return auth;
}

export async function requireUser(request: NextRequest, locale: string) {
  const auth = await resolveAuth(request);
  if (!auth.isAuthenticated) {
    const response = redirectToLogin(request, locale);
    applyAuthCookies(response, auth);
    return response;
  }

  if (auth.user?.role !== "user") {
    const destination = auth.user?.role === "admin" ? `/${locale}/admin` : `/${locale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    applyAuthCookies(response, auth);
    return response;
  }

  return auth;
}
