"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission, type PermissionSet } from "@/lib/rbac";

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(() => {
    const role = user?.role;
    const permissions = (user?.permissions ?? null) as PermissionSet | null;

    return {
      role,
      permissions,
      isAdmin: role === "admin",
      isStaffOrAdmin: role === "staff" || role === "admin",
      can: (key: keyof PermissionSet) => hasPermission(role, permissions, key),
      canViewDashboard: hasPermission(role, permissions, "canViewDashboard"),
      canCheckIn: hasPermission(role, permissions, "canCheckIn"),
      canSell: hasPermission(role, permissions, "canSell"),
      canViewOrders: hasPermission(role, permissions, "canViewOrders"),
      canViewCustomers: hasPermission(role, permissions, "canViewCustomers"),
    };
  }, [user]);
}
