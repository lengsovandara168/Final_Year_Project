"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  BadgePercent,
  ChevronDown,
  Filter,
  Package,
  Smartphone,
  Star,
  Tablet,
  TrendingUp,
} from "lucide-react";

import { useAddToCartWithToast } from "@/hooks/use-add-to-cart";
import { useDebounce } from "@/hooks/use-debounce";
import { useShopData } from "@/hooks/use-shop-data";
import { usePathname, useRouter } from "@/i18n/routing";
import { useWishlist } from "@/contexts/wishlist-context";
import { getSessionSnapshot } from "@/lib/auth-session";
import { searchProducts, type Product } from "@/lib/api";
import { SHOP_NEWS_TEMPLATES } from "@/lib/shop.constants";
import type {
  Category,
  NewsItem,
  ShopCategoryId,
  SortOption,
} from "@/lib/shop.types";
import { ShopCategoryView } from "@/lib/shop.types";
import { isAllShopCategory, parseShopCategory } from "@/lib/shop-category";
import {
  deduplicateProductTemplates,
  filterProducts,
  getAvailableBrands,
  sortProducts,
} from "@/lib/shop.utils";

import BrandSidebar from "@/components/shop/BrandSidebar";
import ProductCategoryTabs from "@/components/shop/product-category-tabs";
import ProductGridSection from "@/components/shop/ProductGridSection";
import ProductResultsGrid from "@/components/shop/ProductResultsGrid";

import ShopHeroCarousel from "@/components/shop/ShopHeroCarousel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SortDropdown({
  t,
  onSelect,
}: {
  t: ReturnType<typeof useTranslations>;
  onSelect: (value: SortOption) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {t("sortBy")}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSelect("price-low")}>
          {t("priceLowToHigh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("price-high")}>
          {t("priceHighToLow")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("popular")}>
          {t("mostPopular")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("newest")}>
          {t("newest")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("rating")}>
          {t("bestRating")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProductListing() {
  const t = useTranslations("Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isBrandFilterOpen, setIsBrandFilterOpen] = useState(false);

  const addToCartWithToast = useAddToCartWithToast();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const { products, popularProducts, bestSellers, brandsByCategory } =
    useShopData();

  const parseSort = (value: string | null): SortOption => {
    if (
      value === "newest" ||
      value === "price-low" ||
      value === "price-high" ||
      value === "popular" ||
      value === "rating"
    ) {
      return value;
    }

    return "newest";
  };

  const selectedCategory = parseShopCategory(searchParams.get("category"));
  const selectedBrand = searchParams.get("brand") || "all";
  const selectedSort = parseSort(searchParams.get("sort"));
  const searchQuery = searchParams.get("search") || "";
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500);

  const updateUrlState = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());

    const nextCategory = updates.category ?? selectedCategory;
    const nextBrand = updates.brand ?? selectedBrand;
    const nextSort = updates.sort ?? selectedSort;
    const nextQuery = (updates.q ?? updates.search ?? searchQuery).trim();

    if (nextCategory && !isAllShopCategory(nextCategory as ShopCategoryView))
      params.set("category", nextCategory);
    else params.delete("category");

    if (nextBrand && nextBrand !== "all") params.set("brand", nextBrand);
    else params.delete("brand");

    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
    else params.delete("sort");

    if (nextQuery) params.set("search", nextQuery);
    else params.delete("search");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const {
    data: serverSearchProducts = [],
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["shop-products-search", debouncedSearchQuery],
    enabled: debouncedSearchQuery.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const accessToken = getSessionSnapshot().accessToken;
      if (!accessToken) return [];

      const response = await searchProducts(accessToken, debouncedSearchQuery);
      return deduplicateProductTemplates(response.data || []);
    },
  });

  const categories = useMemo<Category[]>(
    () => [
      {
        id: ShopCategoryView.ALL,
        name: t("allProducts"),
        icon: <Package className="h-4 w-4" />,
      },
      {
        id: ShopCategoryView.PHONE,
        name: t("phones"),
        icon: <Smartphone className="h-4 w-4" />,
      },
      {
        id: ShopCategoryView.TABLET,
        name: t("tablets"),
        icon: <Tablet className="h-4 w-4" />,
      },
      {
        id: ShopCategoryView.ACCESSORIES,
        name: t("accessories"),
        icon: <Package className="h-4 w-4" />,
      },
      {
        id: ShopCategoryView.OFFER,
        name: t("specialOffer"),
        icon: <BadgePercent className="h-4 w-4" />,
      },
    ],
    [t],
  );

  const newsItems = useMemo<NewsItem[]>(
    () =>
      SHOP_NEWS_TEMPLATES.map((item) => ({
        id: item.id,
        title: t(item.titleKey),
        description: t(item.descriptionKey),
        image: item.image,
        link: item.link,
        bgColor: item.bgColor,
      })),
    [t],
  );

  const availableBrands = useMemo(
    () => getAvailableBrands(selectedCategory, brandsByCategory),
    [brandsByCategory, selectedCategory],
  );

  const isProductAvailable = (product: Product) =>
    typeof product.availableStock === "number"
      ? product.availableStock > 0
      : Boolean(product.inStock);

  const inStockPopularProducts = useMemo(
    () => popularProducts.filter(isProductAvailable),
    [popularProducts],
  );

  const inStockBestSellers = useMemo(
    () => bestSellers.filter(isProductAvailable),
    [bestSellers],
  );

  const sortedFilteredProducts = useMemo(() => {
    const sourceProducts =
      debouncedSearchQuery.length > 0
        ? serverSearchProducts.length > 0
          ? serverSearchProducts
          : products
        : products;

    const inStockSourceProducts = sourceProducts.filter(isProductAvailable);

    const filtered = filterProducts({
      products: inStockSourceProducts,
      selectedCategory,
      selectedBrand: selectedCategory === "all" ? "all" : selectedBrand,
      searchQuery,
      brandsByCategory,
    });

    return sortProducts(filtered, selectedSort);
  }, [
    brandsByCategory,
    debouncedSearchQuery,
    products,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSort,
    serverSearchProducts,
  ]);

  const handleAddToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (product) {
      addToCartWithToast(product, 1);
    }
  };

  const handleSelectBrand = (brandId: string) => {
    updateUrlState({ brand: brandId });
    setIsBrandFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductCategoryTabs />

      {selectedCategory === ShopCategoryView.ALL && (
        <section className="relative overflow-hidden">
          <ShopHeroCarousel
            newsItems={newsItems}
            buyNowLabel={t("buyNow")}
            fallbackBadgeLabel={t("newArrivals")}
            fallbackTitle={t("discoverLatestTech")}
            fallbackDescription={t("discoverSubtitle")}
            fallbackCtaLabel={t("shopPhones")}
            onFallbackCtaAction={() =>
              updateUrlState({ category: "phone", brand: "all", search: "" })
            }
          />
        </section>
      )}
      <div
        id="products-results"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {selectedCategory === ShopCategoryView.ALL && (
          <>
            <ProductGridSection
              title={t("popularProducts")}
              icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
              products={inStockPopularProducts}
              emptyMessage={t("noPopularProducts")}
              useCarousel
              onAddToCartAction={handleAddToCart}
              onWishlistClickAction={toggleWishlist}
              isWishlistedAction={isWishlisted}
            />

            <ProductGridSection
              title={t("bestSellerProducts")}
              icon={<Star className="h-5 w-5 text-yellow-500" />}
              products={inStockBestSellers}
              emptyMessage={t("noBestSellers")}
              useCarousel
              onAddToCartAction={handleAddToCart}
              onWishlistClickAction={toggleWishlist}
              isWishlistedAction={isWishlisted}
            />
          </>
        )}

        {selectedCategory !== ShopCategoryView.ALL && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="hidden lg:block">
              <BrandSidebar
                brands={availableBrands ?? []}
                selectedBrand={selectedBrand}
                filterByBrandLabel={t("filterByBrand")}
                allLabel={t("all")}
                onSelectBrandAction={handleSelectBrand}
                variant="desktop"
              />
            </div>

            <section className="flex-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  {
                    categories.find((item) => item.id === selectedCategory)
                      ?.name
                  }
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setIsBrandFilterOpen(true)}
                    disabled={availableBrands.length === 0}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {t("filterByBrand")}
                  </Button>
                  <SortDropdown
                    t={t}
                    onSelect={(value) => updateUrlState({ sort: value })}
                  />
                </div>
              </div>

              <ProductResultsGrid
                isSearchActive={debouncedSearchQuery.length > 0}
                isFetching={isSearchFetching}
                isError={isSearchError}
                products={sortedFilteredProducts}
                emptyMessage={
                  searchQuery ? t("noSearchResults") : t("noCategoryProducts")
                }
                columnsClassName="grid grid-cols-2 gap-4 xl:grid-cols-3"
                onAddToCartAction={handleAddToCart}
                onWishlistClickAction={toggleWishlist}
                isWishlistedAction={isWishlisted}
              />
            </section>
          </div>
        )}

        {selectedCategory === ShopCategoryView.ALL && (
          <section id="all-products-section">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t("allProducts")}</h2>
              <SortDropdown
                t={t}
                onSelect={(value) => updateUrlState({ sort: value })}
              />
            </div>

            <ProductResultsGrid
              isSearchActive={debouncedSearchQuery.length > 0}
              isFetching={isSearchFetching}
              isError={isSearchError}
              products={sortedFilteredProducts}
              emptyMessage={
                searchQuery ? t("noSearchResults") : t("noProductsYet")
              }
              onAddToCartAction={handleAddToCart}
              onWishlistClickAction={toggleWishlist}
              isWishlistedAction={isWishlisted}
            />
          </section>
        )}
      </div>

      <Sheet open={isBrandFilterOpen} onOpenChange={setIsBrandFilterOpen}>
        <SheetContent side="bottom" className="h-[78vh] rounded-t-3xl p-0">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle>{t("filterByBrand")}</SheetTitle>
          </SheetHeader>

          <div className="h-[calc(78vh-4.5rem)] overflow-y-auto p-4">
            <BrandSidebar
              brands={availableBrands ?? []}
              selectedBrand={selectedBrand}
              filterByBrandLabel={t("filterByBrand")}
              allLabel={t("all")}
              onSelectBrandAction={handleSelectBrand}
              variant="drawer"
              className="w-full"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
