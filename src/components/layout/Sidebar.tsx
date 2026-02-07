"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Menu,
  X,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Products",
    href: "/products",
    icon: Smartphone,
    badge: "12",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    badge: "5",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-white shadow-md"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out",
          "fixed left-0 top-0 z-40 h-screen lg:relative lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          isCollapsed ? "w-0 lg:w-64" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4 lg:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="text-sm lg:text-lg font-bold truncate">PhoneShop</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-3 lg:p-4 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsCollapsed(true)}
                className={cn(
                  "flex items-center justify-between gap-2 lg:gap-3 rounded-lg px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 lg:px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="border-t border-slate-700 p-3 lg:p-4 space-y-2">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Account
          </p>
          <Button
            variant="ghost"
            className="w-full justify-start text-xs lg:text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-xs lg:text-sm text-slate-300 hover:bg-slate-700/50 hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
