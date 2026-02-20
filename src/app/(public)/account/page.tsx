"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShop } from "@/contexts/shop-context";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  ShoppingBag,
  CreditCard,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { isAuthenticated, user, logout } = useShop();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-500 mb-6">
          You need to be logged in to view your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/en/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/en/register">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "My Orders",
      description: "View and track your orders",
      icon: Package,
      href: "/orders",
    },
    {
      title: "Wishlist",
      description: "Products you've saved",
      icon: Heart,
      href: "/account/wishlist",
    },
    {
      title: "Addresses",
      description: "Manage shipping addresses",
      icon: MapPin,
      href: "/account/addresses",
    },
    {
      title: "Payment Methods",
      description: "Manage payment options",
      icon: CreditCard,
      href: "/account/payment",
    },
    {
      title: "Account Settings",
      description: "Update your profile",
      icon: Settings,
      href: "/account/settings",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black font-medium">My Account</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
                <span className="text-3xl font-bold text-gray-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Button
                variant="outline"
                className="mt-4 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Orders Preview */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link
                  href="/orders"
                  className="text-sm font-medium hover:underline flex items-center"
                >
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200">
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">ORD-2026-001</p>
                    <p className="text-sm text-gray-500">Feb 18, 2026 • 2 items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,299</p>
                    <p className="text-sm text-green-600">Delivered</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200">
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">ORD-2026-002</p>
                    <p className="text-sm text-gray-500">Feb 15, 2026 • 1 item</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$449</p>
                    <p className="text-sm text-blue-600">Shipped</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
