"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Scan,
  CreditCard,
  Package,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/pos", icon: Home, label: "POS" },
  { href: "/pos/scan", icon: Scan, label: "Scan" },
  { href: "/pos/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/pos/checkout", icon: CreditCard, label: "Checkout" },
  { href: "/stock", icon: Package, label: "Stock" },
];

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b bg-black px-4 text-white">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <Link href="/pos" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-black font-bold">
              PS
            </div>
            <span className="font-semibold hidden sm:inline">PhoneShop POS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>Cashier 1</span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Admin</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <nav className="absolute left-0 top-14 w-64 h-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation for Mobile/Tablet */}
      <nav className="lg:hidden flex items-center justify-around border-t bg-white py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-black" : "text-gray-400"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
