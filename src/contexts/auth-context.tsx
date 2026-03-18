"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  clearAuthSession,
  getSessionSnapshot,
  persistAuthSession,
  type AuthSessionPayload,
} from "@/lib/auth-session";
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
    const session = getSessionSnapshot();

    if (session.accessToken && session.user) {
      setUser(session.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
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
