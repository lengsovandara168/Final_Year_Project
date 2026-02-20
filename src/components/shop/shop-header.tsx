"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/contexts/shop-context";

export function ShopHeader() {
  const router = useRouter();
  const { cartCount, setIsCartOpen, isAuthenticated, user, logout } = useShop();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      router.push("/en/login");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white font-bold">
          PS
        </div>
        <span className="hidden sm:inline-block text-xl font-bold">PhoneShop</span>
      </Link>

      {/* Search - Desktop */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-gray-50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* User */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleAuthClick}
        >
          <User className="h-5 w-5" />
          <span className="hidden sm:inline-block">
            {isAuthenticated ? user?.name : "Login"}
          </span>
        </Button>

        {/* Cart */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-black text-white text-xs">
              {cartCount > 99 ? "99+" : cartCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}
