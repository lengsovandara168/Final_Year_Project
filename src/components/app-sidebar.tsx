"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react";
import { useLogout } from "@/hooks/use-logout";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: string;
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const handleLogout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const adminBasePath = `/${locale}/admin`;

  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  const navigation: NavItem[] = [
    ...(isAdmin
      ? [{ title: t("dashboard"), url: adminBasePath, icon: LayoutDashboard }]
      : []),
    ...(isAdmin || isStaff
      ? [
          {
            title: t("products"),
            url: `${adminBasePath}/products`,
            icon: Package,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: t("orders"),
            url: `${adminBasePath}/orders`,
            icon: ShoppingCart,
          },
          {
            title: t("customers"),
            url: `${adminBasePath}/customers`,
            icon: Users,
          },
          {
            title: t("sales"),
            url: `${adminBasePath}/sales`,
            icon: DollarSign,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={adminBasePath}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                  <img
                    src="/logo/logo.png"
                    alt="Logo"
                    className="size-10 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User2 />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{t("admin")}</span>
                    <span className="truncate text-xs capitalize">{role}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
                align="start"
              >
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setIsLoggingOut(true);
                    await handleLogout();
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  <span>
                    {isLoggingOut ? `${t("logout")}...` : t("logout")}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
