"use client";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export type AuthSessionPayload = {
  name: string;
  userId: string;
  email: string;
  role: string;
  accessToken: string;
};

type SessionSnapshot = {
  user: SessionUser | null;
  accessToken: string | null;
};

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

export function persistAuthSession(payload: AuthSessionPayload) {
  const user: SessionUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };

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
        typeof parsed.name === "string" &&
        typeof parsed.id === "string" &&
        typeof parsed.email === "string" &&
        typeof parsed.role === "string"
      ) {
        user = {
          name: parsed.name,
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
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
