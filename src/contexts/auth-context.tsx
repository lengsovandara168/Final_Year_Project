"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  clearAuthSession,
  getSessionSnapshot,
  persistAuthSession,
  type AuthSessionPayload,
} from "@/lib/auth-session";
import { getMe } from "@/lib/api";
import type { PermissionSet } from "@/lib/rbac";

interface User {
  name: string;
  id: string;
  email: string;
  role: string;
  permissions: PermissionSet | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: AuthSessionPayload) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load auth session from cookies after mount to avoid hydration mismatch
  React.useEffect(() => {
    let isCancelled = false;

    const loadSession = async () => {
      const session = getSessionSnapshot();

      if (!session.accessToken) {
        if (!isCancelled) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      if (session.user && !isCancelled) {
        setUser(session.user);
        setIsAuthenticated(true);
      }

      try {
        const profile = await getMe(session.accessToken);
        const resolvedId = profile.userId ?? profile.user_id ?? session.user?.id;
        const resolvedEmail = profile.email || session.user?.email;
        const resolvedRole = profile.role || session.user?.role;
        const resolvedName =
          profile.name || "User";

        if (!resolvedId || !resolvedEmail || !resolvedRole) {
          throw new Error("Invalid user profile response");
        }

        const nextUser: User = {
          id: resolvedId,
          email: resolvedEmail,
          role: resolvedRole,
          name: resolvedName,
          permissions: session.user?.permissions ?? null,
        };

        if (session.user) {
          // No need to update session user name from fallback, always use backend name
        } else {
          persistAuthSession({
            userId: resolvedId,
            email: resolvedEmail,
            role: resolvedRole,
            name: profile.name || "User",
            permissions: nextUser.permissions,
            accessToken: session.accessToken,
          });
        }

        if (!isCancelled) {
          setUser(nextUser);
          setIsAuthenticated(true);
        }
      } catch {
        if (!isCancelled) {
          setUser(session.user);
          setIsAuthenticated(Boolean(session.user));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = (payload: AuthSessionPayload) => {
    persistAuthSession(payload);
    setUser({
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthSession();
    localStorage.removeItem("verifyEmail");
    localStorage.removeItem("verifyFlow");
    localStorage.removeItem("verifyName");
    localStorage.removeItem("postLoginRedirect");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
