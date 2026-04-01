"use client";

import { useCallback } from "react";

import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import { ShopCategoryView } from "@/lib/shop.types";
import { isAllShopCategory, parseShopCategory } from "@/lib/shop-category";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { id: ShopCategoryView.ALL, label: "allProducts" },
  { id: ShopCategoryView.PHONE, label: "phones" },
  { id: ShopCategoryView.TABLET, label: "tablets" },
  { id: ShopCategoryView.ACCESSORIES, label: "accessories" },
  { id: ShopCategoryView.OFFER, label: "specialOffer" },
] as const;

export default function ProductCategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Shop");

  const activeTab = parseShopCategory(searchParams.get("category"));

  const handleTabChange = useCallback(
    (tabId: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("page", "1");
      newSearchParams.delete("search");
      newSearchParams.delete("brand");

      if (tabId && !isAllShopCategory(tabId as ShopCategoryView)) {
        newSearchParams.set("category", tabId);
      } else {
        newSearchParams.delete("category");
      }

      router.push(`?${newSearchParams.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="sticky top-16 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="relative">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList
              variant="line"
              className="h-auto w-full flex-nowrap justify-start gap-4 overflow-x-auto bg-transparent p-0 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map(({ id, label }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex-none whitespace-nowrap px-0 py-2 text-sm font-medium text-gray-500 shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:text-black"
                >
                  {t(label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-l from-white to-transparent md:hidden" />
        </div>
      </div>
    </div>
  );
}
