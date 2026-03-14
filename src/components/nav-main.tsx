"use client";

import { Home, Package, ShoppingCart, Users, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

const menuItems = [
  {
    key: "Dashboard.title",
    icon: Home,
    path: "",
  },
  {
    key: "Dashboard.stats.products",
    icon: Package,
    path: "/products",
  },
  {
    key: "Dashboard.stats.totalOrders",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    key: "Dashboard.stats.customers",
    icon: Users,
    path: "/customers",
  },
  {
    key: "POS.title",
    icon: Zap,
    path: "/pos/stock",
  },
];

export function NavMain() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const adminBasePath = `/${locale}/admin`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
        {t("navigation")}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = `${adminBasePath}${item.path}`;
            const isActive =
              pathname === href || pathname?.startsWith(href + "/");

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={t(item.key)}
                  size="default"
                  className="h-10"
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    <span>{t(item.key)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
