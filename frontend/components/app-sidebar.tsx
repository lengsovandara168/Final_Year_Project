"use client";

import { Home, Smartphone, ShoppingCart, Users, BarChart3, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    badge: null,
  },
  {
    title: "Products",
    url: "/products",
    icon: Smartphone,
    badge: "12",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    badge: "5",
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    badge: null,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    badge: null,
  },
];

const accountItems = [
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
  },
  {
    title: "Logout",
    url: "#logout",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800">
      {/* Header - Logo Section */}
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 py-4 px-3">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 ease-out group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <Smartphone className="h-4 w-4" />
          </div>
          <span className="font-bold text-base truncate group-data-[collapsible=icon]:hidden text-slate-900 dark:text-slate-50 tracking-tight">
            PhoneShop
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-600 dark:text-slate-400 uppercase text-xs font-semibold px-2 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "relative transition-all duration-200 ease-out group/btn",
                      "hover:bg-slate-100 dark:hover:bg-slate-900",
                      "active:scale-95",
                      isActive && "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate group-data-[collapsible=icon]:hidden text-sm">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white flex-shrink-0 group-data-[collapsible=icon]:hidden shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Account Section */}
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 py-4 px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-600 dark:text-slate-400 uppercase text-xs font-semibold px-2 mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isLogout = item.title === "Logout";
              
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "relative transition-all duration-200 ease-out",
                      "hover:bg-slate-100 dark:hover:bg-slate-900",
                      "active:scale-95",
                      isLogout && "hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <Icon className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                        isLogout && "group-hover:text-red-600 dark:group-hover:text-red-400"
                      )} />
                      <span className="flex-1 truncate group-data-[collapsible=icon]:hidden text-sm">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
