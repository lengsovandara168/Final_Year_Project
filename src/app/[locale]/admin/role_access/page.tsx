"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, UserPlus2, X } from "lucide-react";
import {
  getAdminUsers,
  getAdminUserPermissions,
  updateAdminUserPermissions,
  updateAdminUserRole,
  type AdminUser,
} from "@/lib/api";
import {
  EMPTY_PERMISSIONS,
  normalizePermissions,
  type PermissionSet,
  type UserRole,
} from "@/lib/rbac";

const ROLE_OPTIONS: UserRole[] = ["user", "staff", "admin"];

const PERMISSION_ITEMS: ReadonlyArray<{
  key: keyof PermissionSet;
  label: string;
}> = [
  { key: "canCheckIn", label: "Check-in" },
  { key: "canSell", label: "Sell" },
  { key: "canViewOrders", label: "View Orders" },
  { key: "canViewCustomers", label: "View Customers" },
  { key: "canViewDashboard", label: "View Dashboard" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffPermissionsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissionsByUser, setPermissionsByUser] = useState<
    Record<string, PermissionSet>
  >({});
  const [loadingPermissionsByUser, setLoadingPermissionsByUser] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [savingRoleUserId, setSavingRoleUserId] = useState<string | null>(null);
  const [savingPermissionUserId, setSavingPermissionUserId] = useState<
    string | null
  >(null);
  const [isAddingStaffByEmail, setIsAddingStaffByEmail] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        let loadedUsers: AdminUser[] = [];

        try {
          const response = await getAdminUsers();
          console.log("getAdminUsers response:", response);
          loadedUsers = Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error("getAdminUsers failed:", error);
          const fallback = await fetch("/api/staff-permissions/by-user", {
            cache: "no-store",
          });

          if (!fallback.ok) {
            throw new Error("Failed to load users");
          }

          const payload = (await fallback.json()) as {
            users?: Array<{
              id?: string;
              email?: string;
              name?: string;
              role?: string;
            }>;
          };

          loadedUsers = (payload.users ?? [])
            .filter(
              (user) =>
                typeof user.id === "string" && typeof user.email === "string",
            )
            .map(
              (user) =>
                ({
                  id: user.id as string,
                  email: user.email as string,
                  name: typeof user.name === "string" ? user.name : undefined,
                  role:
                    user.role === "admin" ||
                    user.role === "staff" ||
                    user.role === "user"
                      ? user.role
                      : "user",
                }) satisfies AdminUser,
            );
        }

        if (!mounted) {
          return;
        }

        setUsers(loadedUsers);

        for (const user of loadedUsers) {
          if (user.role !== "staff") {
            continue;
          }

          setLoadingPermissionsByUser((prev) => ({ ...prev, [user.id]: true }));

          try {
            const permissionResponse = await getAdminUserPermissions(user.id);
            if (!mounted) {
              return;
            }

            const normalized =
              normalizePermissions(permissionResponse.permissions) ??
              EMPTY_PERMISSIONS;

            setPermissionsByUser((prev) => ({
              ...prev,
              [user.id]: normalized,
            }));
          } catch {
            if (!mounted) {
              return;
            }
            toast.error(`Failed to load permissions for ${user.email}`);
          } finally {
            if (mounted) {
              setLoadingPermissionsByUser((prev) => ({
                ...prev,
                [user.id]: false,
              }));
            }
          }
        }
      } catch {
        if (!mounted) {
          return;
        }
        toast.error("Could not load users.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(text) ||
        (user.name ?? "").toLowerCase().includes(text) ||
        user.role.toLowerCase().includes(text)
      );
    });
  }, [users, query]);

  const totalUsers = users.length;
  const totalStaff = users.filter((user) => user.role === "staff").length;
  const filteredCount = filteredUsers.length;

  const updateRole = async (userId: string, role: UserRole) => {
    const previousUsers = users;
    setSavingRoleUserId(userId);

    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role } : user)),
    );

    try {
      await updateAdminUserRole(userId, role);
      toast.success("Role updated.");

      if (role === "staff") {
        const permissionResponse = await getAdminUserPermissions(userId);
        const normalized =
          normalizePermissions(permissionResponse.permissions) ??
          EMPTY_PERMISSIONS;

        setPermissionsByUser((prev) => ({
          ...prev,
          [userId]: normalized,
        }));
      }
    } catch (error) {
      setUsers(previousUsers);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update role: ${message}`);
      throw error; // Re-throw so callers can handle
    } finally {
      setSavingRoleUserId(null);
    }
  };

  const togglePermission = async (
    user: AdminUser,
    key: keyof PermissionSet,
  ) => {
    if (user.role !== "staff") {
      return;
    }

    const current = permissionsByUser[user.id] ?? EMPTY_PERMISSIONS;
    const next: PermissionSet = {
      ...current,
      [key]: !current[key],
    };

    setSavingPermissionUserId(user.id);
    setPermissionsByUser((prev) => ({
      ...prev,
      [user.id]: next,
    }));

    try {
      await updateAdminUserPermissions(user.id, { [key]: next[key] });
      toast.success("Permission updated.");
    } catch {
      setPermissionsByUser((prev) => ({
        ...prev,
        [user.id]: current,
      }));
      toast.error("Failed to update permission. Changes rolled back.");
    } finally {
      setSavingPermissionUserId(null);
    }
  };

  const addStaffByEmail = async () => {
    const normalizedEmail = staffEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Please enter an email.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Please enter a valid email format.");
      return;
    }

    setIsAddingStaffByEmail(true);

    try {
      // Step 1: Search for user in local list first
      let targetUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail,
      );

      // Step 2: If not found locally, fetch fresh user list
      if (!targetUser) {
        toast.loading("Searching for user...");
        try {
          const response = await getAdminUsers();
          const loadedUsers = Array.isArray(response.data) ? response.data : [];
          setUsers(loadedUsers);
          targetUser = loadedUsers.find(
            (user) => user.email.toLowerCase() === normalizedEmail,
          );
        } catch (searchError) {
          toast.dismiss();
          throw new Error(
            `Unable to search for user: ${
              searchError instanceof Error ? searchError.message : "Unknown error"
            }`,
          );
        }
      }

      // Step 3: User not found
      if (!targetUser) {
        toast.error("User not found for this email.");
        return;
      }

      // Step 4: User already staff
      if (targetUser.role === "staff") {
        toast.success("This user is already staff.");
        setStaffEmail("");
        return;
      }

      // Step 5: Update role to staff
      await updateRole(targetUser.id, "staff");
      setStaffEmail("");
      toast.success("User promoted to staff.");
    } catch (error) {
      // Error handling - updateRole already shows toast on failure
      console.error("addStaffByEmail error:", error);
    } finally {
      setIsAddingStaffByEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-75">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  {PERMISSION_ITEMS.map((item) => (
                    <TableHead key={item.key} className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </TableCell>
                    {PERMISSION_ITEMS.map((item) => (
                      <TableCell
                        key={`${index}-${item.key}`}
                        className="text-center"
                      >
                        <div className="flex justify-center">
                          <Skeleton className="h-6 w-11 rounded-full" />
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Staff Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Change role and toggle staff permissions per user.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserPlus2 className="h-4 w-4" />
              Add staff by email
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="Staff email"
                placeholder="example@company.com"
                value={staffEmail}
                onChange={(event) => setStaffEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addStaffByEmail();
                  }
                }}
                className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                type="button"
                onClick={() => void addStaffByEmail()}
                disabled={isAddingStaffByEmail}
                className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingStaffByEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Staff"
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: Press Enter to submit quickly.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Total users: {totalUsers}</Badge>
        <Badge variant="secondary">Staff: {totalStaff}</Badge>
        <Badge variant="secondary">Filtered: {filteredCount}</Badge>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-75">User</TableHead>
                <TableHead className="text-center">Role</TableHead>
                {PERMISSION_ITEMS.map((item) => (
                  <TableHead key={item.key} className="text-center">
                    {item.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={PERMISSION_ITEMS.length + 2}>
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No users found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          void updateRole(
                            user.id,
                            event.target.value as UserRole,
                          )
                        }
                        disabled={savingRoleUserId === user.id}
                        className="h-9 rounded-md border bg-white px-2 text-sm"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {savingRoleUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                  </TableCell>

                  {PERMISSION_ITEMS.map((item) => {
                    const currentPermissions =
                      permissionsByUser[user.id] ?? EMPTY_PERMISSIONS;
                    const isPermissionLoading =
                      loadingPermissionsByUser[user.id];
                    const permissionDisabled =
                      user.role !== "staff" ||
                      savingPermissionUserId === user.id ||
                      isPermissionLoading;

                    return (
                      <TableCell
                        key={`${user.id}-${item.key}`}
                        className="text-center"
                      >
                        {isPermissionLoading ? (
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-11 rounded-full" />
                          </div>
                        ) : (
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={currentPermissions[item.key]}
                              disabled={permissionDisabled}
                              onChange={() =>
                                void togglePermission(user, item.key)
                              }
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:inset-s-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
                          </label>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
