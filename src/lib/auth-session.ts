"use client";

import type { PermissionSet } from "@/lib/rbac";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  profilePhotoUrl?: string;
  permissions: PermissionSet | null;
};

export type AuthSessionPayload = {
  name: string;
  userId: string;
  email: string;
  role: string;
  permissions: PermissionSet | null;
  accessToken: string;
};

type SessionSnapshot = {
  user: SessionUser | null;
  accessToken: string | null;
};

const REMEMBERED_USER_NAMES_KEY = "remembered_user_names";

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${name}=`;
  const cookies = document.cookie.split(";");

  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = 60 * 60 * 24 * 7,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readRememberedUserNames(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = localStorage.getItem(REMEMBERED_USER_NAMES_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([email, name]) =>
          typeof email === "string" &&
          typeof name === "string" &&
          name.trim().length > 0,
      ),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

export function rememberUserName(email: string, name: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedName = name.trim();

  if (!normalizedEmail || !normalizedName) {
    return;
  }

  const nextNames = {
    ...readRememberedUserNames(),
    [normalizedEmail]: normalizedName,
  };

  localStorage.setItem(REMEMBERED_USER_NAMES_KEY, JSON.stringify(nextNames));
}

export function getRememberedUserName(email: string): string | null {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  return readRememberedUserNames()[normalizedEmail] ?? null;
}

export function persistAuthSession(payload: AuthSessionPayload) {
  const user: SessionUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    permissions: payload.permissions,
  };

  rememberUserName(payload.email, payload.name);
  setCookie("access_token", payload.accessToken);
  setCookie("auth_user", JSON.stringify(user));

  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", payload.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(user));
    sessionStorage.setItem("access_token", payload.accessToken);
    sessionStorage.setItem("auth_user", JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "auth_user=; Path=/; Max-Age=0; SameSite=Lax";

  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("auth_user");
  }
}

export function getSessionSnapshot(): SessionSnapshot {
  const accessToken = getCookieValue("access_token");
  const rawUser = getCookieValue("auth_user");

  let user: SessionUser | null = null;
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser) as Partial<SessionUser>;
      if (
        typeof parsed.id === "string" &&
        typeof parsed.email === "string" &&
        typeof parsed.role === "string"
      ) {
        const fallbackName = getRememberedUserName(parsed.email) ?? "User";
        user = {
          name: typeof parsed.name === "string" ? parsed.name : fallbackName,
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
          profilePhotoUrl:
            typeof parsed.profilePhotoUrl === "string"
              ? parsed.profilePhotoUrl
              : undefined,
          permissions:
            parsed.permissions && typeof parsed.permissions === "object"
              ? {
                  canCheckIn: Boolean(parsed.permissions.canCheckIn),
                  canSell: Boolean(parsed.permissions.canSell),
                  canViewOrders: Boolean(parsed.permissions.canViewOrders),
                  canViewCustomers: Boolean(parsed.permissions.canViewCustomers),
                  canViewDashboard: Boolean(parsed.permissions.canViewDashboard),
                }
              : null,
        };
      }
    } catch {
      user = null;
    }
  }

  return {
    user,
    accessToken,
  };
}

export function updateSessionUser(patch: Partial<SessionUser>) {
  const snapshot = getSessionSnapshot();
  if (!snapshot.user) return;

  const nextUser: SessionUser = {
    ...snapshot.user,
    ...patch,
    id: snapshot.user.id,
    email: snapshot.user.email,
    role: snapshot.user.role,
  };

  const serialized = JSON.stringify(nextUser);
  rememberUserName(nextUser.email, nextUser.name);
  setCookie("auth_user", serialized);

  if (typeof window !== "undefined") {
    localStorage.setItem("auth_user", serialized);
    sessionStorage.setItem("auth_user", serialized);
  }
}
