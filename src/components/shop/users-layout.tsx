"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Search,
  Heart,
  ShoppingCart,
  User,
  ReceiptText,
  LogOut,
} from "lucide-react";
import Image from "next/image";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersLayoutHeader() {
  const t = useTranslations("Shop");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getCartCount } = useCart();
  const { user } = useAuth();
  const handleLogout = useLogout();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      const params = new URLSearchParams(searchParams);
      params.set("search", trimmed);
      params.set("page", "1");
      router.push(`/users?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <PageHeader
      className="sticky top-0 z-50 border-b bg-white"
      containerClassName="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10"
    >
      <div className="relative flex h-16 items-center justify-between gap-3">
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href="/users"
            className="flex items-center"
            aria-label="Go to shop home"
          >
            <Image
              src="/logo/logo.png"
              alt="Astrix logo"
              className="rounded-lg object-contain"
              width={80}
              height={80}
            />
            <span className="ml-2 hidden text-xl font-bold sm:block">
              Astrix
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <SidebarTrigger className="shrink-0" />
        </div>

        <div className="flex items-center md:hidden">
          <Link
            href="/users"
            className="flex items-center"
            aria-label="Go to shop home"
          >
            <Image
              src="/logo/logo.png"
              alt="Astrix logo"
              className="rounded-lg object-contain"
              width={80}
              height={80}
            />
            <span className="ml-2 hidden text-xl font-bold sm:block">
              Astrix
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="relative shrink-0"
            onClick={() => router.push("/users/cart")}
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {getCartCount() > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {getCartCount() > 99 ? "99+" : getCartCount()}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            className="relative hidden shrink-0 md:inline-flex"
            onClick={() => router.push("/users/wishlist")}
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden items-center gap-2 md:inline-flex"
                aria-label="Open account menu"
              >
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate text-sm">
                  {(user?.name ?? "User").trim() || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/users/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/users/purchase")}>
                <ReceiptText className="mr-2 h-4 w-4" />
                <span>Purchase</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </PageHeader>
  );
}
