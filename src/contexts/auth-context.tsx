"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
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

  // Load user data from localStorage after mount to avoid hydration mismatch
  React.useEffect(() => {
    const userData = localStorage.getItem("userData");
    const authToken = localStorage.getItem("authToken");

    if (userData && authToken) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User, refreshToken?: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
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
