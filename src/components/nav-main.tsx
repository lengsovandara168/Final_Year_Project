"use client";

import { FolderTree, Home, Package, ShoppingCart, Users } from "lucide-react";
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

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "",
  },
  {
    title: "Products",
    icon: Package,
    path: "/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Manage Categories",
    icon: FolderTree,
    path: "/categories",
  },
];

export function NavMain() {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const adminBasePath = `/${locale}/admin`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
        Navigation
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
                  tooltip={item.title}
                  size="default"
                  className="h-10"
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
