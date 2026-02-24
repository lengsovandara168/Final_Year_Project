import { NextRequest, NextResponse } from "next/server";
import {
  getBackendAuthBaseUrl,
  refreshAccessTokenOnServer,
} from "@/lib/auth-server";

type MePayload = {
  ok?: boolean;
  userId?: string;
  email?: string;
  role?: string;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest) {
  const nextParam = request.nextUrl.searchParams.get("next");
  const fallbackPath = "/en/login";
  const safeNextPath =
    nextParam && nextParam.startsWith("/") ? nextParam : fallbackPath;

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    const response = NextResponse.redirect(new URL(fallbackPath, request.url));
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return response;
  }

  const refreshedAccessToken = await refreshAccessTokenOnServer(refreshToken);
  if (!refreshedAccessToken) {
    const response = NextResponse.redirect(new URL(fallbackPath, request.url));
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return response;
  }

  const meResponse = await fetch(`${getBackendAuthBaseUrl()}/v1/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${refreshedAccessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!meResponse.ok) {
    const response = NextResponse.redirect(new URL(fallbackPath, request.url));
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return response;
  }

  const me = (await meResponse.json()) as MePayload;
  if (!me.ok || !me.userId || !me.email || !me.role) {
    const response = NextResponse.redirect(new URL(fallbackPath, request.url));
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return response;
  }

  const response = NextResponse.redirect(new URL(safeNextPath, request.url));
  response.cookies.set("access_token", refreshedAccessToken, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  response.cookies.set(
    "auth_user",
    JSON.stringify({
      id: me.userId,
      email: me.email,
      role: me.role,
    }),
    {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    },
  );
  // Keep the existing refresh token cookie unless backend rotated it via HttpOnly response.
  response.cookies.set("refresh_token", refreshToken, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  return response;
}
