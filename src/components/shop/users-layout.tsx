"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  X,
} from "lucide-react";
import Image from "next/image";

import { useCart } from "@/contexts/cart-context";
import { useRouter } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UsersLayoutHeader() {
  const t = useTranslations("Shop");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getCartCount } = useCart();

  const qFromUrl = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  const buildSearchParams = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "1");

    const trimmed = value.trim();
    if (trimmed) {
      nextParams.set("search", trimmed);
    } else {
      nextParams.delete("search");
    }

    return nextParams.toString();
  };

  const pushSearch = (value: string) => {
    const query = buildSearchParams(value);
    router.push(query ? `/users?${query}` : "/users", { scroll: false });
  };

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    pushSearch(searchQuery);
    setIsMobileSearchOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <PageHeader
      className="sticky top-0 z-50 border-b bg-white"
      containerClassName="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      {isMobileSearchOpen && (
        <div className="fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] bg-black/5 backdrop-blur-[2px] md:hidden" />
      )}

      <div className="relative flex h-16 items-center justify-between gap-3">
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <div className="flex items-center">
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
          </div>
        </div>

        <div className="hidden max-w-2xl flex-1 md:block">
          <form className="flex" onSubmit={handleSearchSubmit}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-r-none border-r-0 pl-10"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              type="submit"
              className="rounded-l-none bg-black text-white hover:bg-gray-800"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {isMobileSearchOpen ? (
          <form
            className="relative z-50 flex w-full items-center gap-2 rounded-full bg-white/95 p-2 shadow-sm ring-1 ring-black/5 md:hidden"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="h-10 rounded-full border-transparent bg-gray-100 pl-9 pr-9 focus-visible:ring-1"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="shrink-0 rounded-full px-3 text-sm font-medium"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery(qFromUrl);
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <SidebarTrigger className="shrink-0" />
            </div>

            <div className="flex items-center md:hidden">
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
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Button>

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
            </div>
          </>
        )}
      </div>
    </PageHeader>
  );
}
