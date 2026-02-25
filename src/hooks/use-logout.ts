"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { locales } from "@/i18n/routing";
import { logout as logoutRequest } from "@/lib/api";
import { getSessionSnapshot } from "@/lib/auth-session";

export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  return async function handleLogout() {
    const accessToken = getSessionSnapshot().accessToken;

    try {
      if (accessToken) {
        await logoutRequest(accessToken);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();

      const locale = pathname?.split("/").filter(Boolean)[0];
      const hasLocale =
        locale && (locales as readonly string[]).includes(locale);
      router.push(hasLocale ? `/${locale}/login` : "/en/login");
      router.refresh();
    }
  };
}
