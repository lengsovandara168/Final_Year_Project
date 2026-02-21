"use client";

import { ChevronsUpDown, LogOut, Settings, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout as logoutRequest } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { locales } from "@/i18n/routing";

export function NavUser() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutRequest({ refresh_token: refreshToken });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
      document.cookie = "access_token=; Path=/; Max-Age=0";
      document.cookie = "refresh_token=; Path=/; Max-Age=0";

      const locale = pathname?.split("/").filter(Boolean)[0];
      const hasLocale =
        locale && (locales as readonly string[]).includes(locale);
      router.push(hasLocale ? `/${locale}/login` : "/login/email");
      router.refresh();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-black text-white text-xs">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Admin User</span>
                <span className="truncate text-xs text-muted-foreground">
                  admin@phoneshop.com
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
