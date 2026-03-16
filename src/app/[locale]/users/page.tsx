"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useLogout } from "@/hooks/use-logout";
import { useCart } from "@/contexts/cart-context";
import { getSessionSnapshot } from "@/lib/auth-session";
import { getCategoryBoard, getProducts, type Product } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  ShoppingCart,
  Star,
  TrendingUp,
  Smartphone,
  Tablet,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  BadgePercent,
} from "lucide-react";
import { useAddToCartWithToast } from "@/hooks/use-add-to-cart";
import { locales } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";

// Product type imported from @/lib/api
// Includes: id, name, imei, price, originalPrice, image, subcategoryId,
// rating, reviewCount, inStock, isPopular, isBestSeller, description, specifications

// Type definitions for categories
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Type definitions for brands
interface Brand {
  id: string;
  name: string;
  logo?: string; // Brand logo image URL
}

type BoardCategoryKey = "phones" | "tablets" | "accessories";
type BrandLibraryItem = { name: string; domain: string };

const BRAND_LIBRARY: Record<BoardCategoryKey, BrandLibraryItem[]> = {
  phones: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Google", domain: "google.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Honor", domain: "honor.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "OPPO", domain: "oppo.com" },
    { name: "vivo", domain: "vivo.com" },
    { name: "realme", domain: "realme.com" },
    { name: "Motorola", domain: "motorola.com" },
    { name: "Nokia", domain: "nokia.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Nothing", domain: "nothing.tech" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "ZTE", domain: "zte.com.cn" },
    { name: "Meizu", domain: "meizu.com" },
    { name: "Tecno", domain: "tecno-mobile.com" },
    { name: "Infinix", domain: "infinixmobility.com" },
    { name: "itel", domain: "itel-mobile.com" },
  ],
  tablets: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Google", domain: "google.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Acer", domain: "acer.com" },
    { name: "Dell", domain: "dell.com" },
    { name: "HP", domain: "hp.com" },
  ],
  accessories: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Anker", domain: "anker.com" },
    { name: "Belkin", domain: "belkin.com" },
    { name: "UGREEN", domain: "ugreen.com" },
    { name: "Baseus", domain: "baseus.com" },
    { name: "JBL", domain: "jbl.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "Bose", domain: "bose.com" },
    { name: "Sennheiser", domain: "sennheiser.com" },
    { name: "Beats", domain: "beatsbydre.com" },
    { name: "Logitech", domain: "logitech.com" },
    { name: "Razer", domain: "razer.com" },
    { name: "Spigen", domain: "spigen.com" },
    { name: "OtterBox", domain: "otterbox.com" },
    { name: "ESR", domain: "esrgear.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "Google", domain: "google.com" },
    { name: "Nothing", domain: "nothing.tech" },
  ],
};

function buildSourceBrandLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function findLibraryLogoUrl(group: BoardCategoryKey, brandName: string) {
  const normalized = brandName.trim().toLowerCase();
  const match = BRAND_LIBRARY[group].find(
    (item) => item.name.trim().toLowerCase() === normalized,
  );
  return match ? buildSourceBrandLogoUrl(match.domain) : undefined;
}

function buildFallbackBrandLogoUrl(name: string) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="#f3f4f6" />
      <text x="32" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#374151">
        ${initial}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function categoryToBoardKey(category: string) {
  if (category === "phone") return "phones";
  if (category === "tablet") return "tablets";
  if (category === "accessories") return "accessories";
  return null;
}

function buildProductTemplateKey(product: Product) {
  const priceKey = Number(product.price ?? 0).toFixed(2);
  const originalPriceKey =
    product.originalPrice == null
      ? "none"
      : Number(product.originalPrice).toFixed(2);

  if (product.templateId?.trim()) {
    return `template:${product.templateId.trim()}:price:${priceKey}:original:${originalPriceKey}`;
  }

  const normalizedName = product.name.trim().toLowerCase();
  const normalizedStorage = product.storage?.trim().toLowerCase() ?? "";
  const normalizedColor = product.color?.trim().toLowerCase() ?? "";
  return `legacy:${product.subcategoryId}:${normalizedName}:${normalizedStorage}:${normalizedColor}:price:${priceKey}:original:${originalPriceKey}`;
}

function deduplicateProductTemplates(products: Product[]) {
  const grouped = new Map<string, Product>();

  for (const product of products) {
    const key = buildProductTemplateKey(product);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, product);
      continue;
    }

    const preferred = !existing.inStock && product.inStock ? product : existing;
    const maxOriginalPrice = Math.max(
      existing.originalPrice ?? 0,
      product.originalPrice ?? 0,
    );
    const mergedOriginalPrice =
      preferred.originalPrice ?? (maxOriginalPrice || undefined);

    grouped.set(key, {
      ...preferred,
      image: preferred.image || existing.image || product.image,
      description:
        preferred.description || existing.description || product.description,
      storage: preferred.storage || existing.storage || product.storage,
      color: preferred.color || existing.color || product.color,
      price: preferred.price,
      originalPrice: mergedOriginalPrice,
      rating: Math.max(existing.rating, product.rating),
      reviewCount: Math.max(existing.reviewCount, product.reviewCount),
      inStock: existing.inStock || product.inStock,
      isPopular: Boolean(existing.isPopular || product.isPopular),
      isBestSeller: Boolean(existing.isBestSeller || product.isBestSeller),
    });
  }

  return Array.from(grouped.values());
}

// Type definitions for news/banners
interface NewsItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  link?: string;
  bgColor?: string;
}

export default function ShopPage() {
  const t = useTranslations("Shop");
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = useLogout();
  const [products, setProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [brandsByCategory, setBrandsByCategory] = useState<
    Record<string, Brand[]>
  >({
    phone: [],
    tablet: [],
    accessories: [],
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [failedBrandLogos, setFailedBrandLogos] = useState<
    Record<string, boolean>
  >({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const { getCartCount } = useCart();
  const addToCartWithToast = useAddToCartWithToast();
  const [totalSlides, setTotalSlides] = useState(0);

  const categories: Category[] = [
    {
      id: "all",
      name: t("allProducts"),
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "phone",
      name: t("phones"),
      icon: <Smartphone className="h-4 w-4" />,
    },
    { id: "tablet", name: t("tablets"), icon: <Tablet className="h-4 w-4" /> },
    {
      id: "accessories",
      name: t("accessories"),
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "offer",
      name: t("specialOffer"),
      icon: <BadgePercent className="h-4 w-4" />,
    },
  ];

  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: t("news.iphone17Title"),
      description: t("news.iphone17Description"),
      image:
        "https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png",
      link: "#",
    },
    {
      id: 2,
      title: t("news.galaxyS25Title"),
      description: t("news.galaxyS25Description"),
      image:
        "https://images.samsung.com/lb/smartphones/galaxy-s25-ultra/buy/kv_global_PC_v2.jpg?imbypass=true",
      link: "#",
    },
  ];

  // Sync current slide & total slides with carousel API
  useEffect(() => {
    if (!carouselApi) return;

    const update = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
      setTotalSlides(carouselApi.scrollSnapList().length);
    };

    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);

    return () => {
      carouselApi.off("select", update);
      carouselApi.off("reInit", update);
    };
  }, [carouselApi]);

  // Auto-play the carousel every 5 seconds
  useEffect(() => {
    if (!carouselApi || totalSlides <= 1) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselApi, totalSlides]);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = getSessionSnapshot().accessToken;

      if (!accessToken) {
        const locale = pathname?.split("/").filter(Boolean)[0];
        const hasLocale =
          locale && (locales as readonly string[]).includes(locale);
        const next = `${window.location.pathname}${window.location.search}`;
        router.push(
          `${hasLocale ? `/${locale}` : "/en"}/login?next=${encodeURIComponent(next)}`,
        );
        return;
      }

      try {
        // Fetch brand filters
        const board = await getCategoryBoard(accessToken);
        const nextBrands: Record<string, Brand[]> = {
          phone: [],
          tablet: [],
          accessories: [],
        };

        for (const group of board.data) {
          if (group.key === "phones") {
            nextBrands.phone = group.items.map((item) => ({
              id: item.id,
              name: item.name,
              logo: item.iconUrl || findLibraryLogoUrl("phones", item.name),
            }));
          } else if (group.key === "tablets") {
            nextBrands.tablet = group.items.map((item) => ({
              id: item.id,
              name: item.name,
              logo: item.iconUrl || findLibraryLogoUrl("tablets", item.name),
            }));
          } else if (group.key === "accessories") {
            nextBrands.accessories = group.items.map((item) => ({
              id: item.id,
              name: item.name,
              logo:
                item.iconUrl || findLibraryLogoUrl("accessories", item.name),
            }));
          }
        }

        setBrandsByCategory(nextBrands);

        // Fetch products
        const productsResponse = await getProducts(accessToken);
        const allProducts = productsResponse.data || [];
        const uniqueTemplateProducts = deduplicateProductTemplates(allProducts);
        setProducts(uniqueTemplateProducts);
        setPopularProducts(uniqueTemplateProducts.filter((p) => p.isPopular));
        setBestSellers(uniqueTemplateProducts.filter((p) => p.isBestSeller));
      } catch {
        // Keep filter UI empty if data cannot be loaded.
      }
    };

    void fetchData();
  }, [pathname, router]);

  // Get brands for current category
  const boardKey = categoryToBoardKey(selectedCategory);
  const availableBrands = boardKey
    ? (brandsByCategory[selectedCategory] ?? [])
    : [];

  // Get all subcategory IDs for the selected category
  const categorySubcategoryIds =
    selectedCategory !== "all" && brandsByCategory[selectedCategory]
      ? brandsByCategory[selectedCategory].map((b) => b.id)
      : [];

  // Filter products based on category (group), subcategory, and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      categorySubcategoryIds.includes(product.subcategoryId);
    const matchesBrand =
      selectedBrand === "all" || product.subcategoryId === selectedBrand;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.storage ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (product.color ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  // Add to cart handler
  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCartWithToast(product, 1);
    }
  };

  // Get cart count
  const cartCount = getCartCount();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Logo + Search + Cart */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-black">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold hidden sm:block">
                {t("brand")}
              </span>
            </div>

            {/* Full Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    className="pl-10 w-full rounded-r-none border-r-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="rounded-l-none bg-black text-white hover:bg-gray-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cart + Account (aligned to the right) */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Cart on the left */}
              <Button
                variant="outline"
                className="relative shrink-0"
                onClick={() => router.push("/users/cart")}
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Account on the right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative shrink-0"
                    aria-label="Open account menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Categories */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Desktop Category Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "ghost"
                  }
                  size="sm"
                  className={
                    selectedCategory === category.id
                      ? "bg-black text-white hover:bg-gray-800"
                      : ""
                  }
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedBrand("all");
                  }}
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </Button>
              ))}
            </div>

            {/* Mobile Category Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {categories.find((c) => c.id === selectedCategory)?.icon}
                    <span className="ml-2">
                      {categories.find((c) => c.id === selectedCategory)
                        ?.name || t("categories")}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedBrand("all");
                      }}
                    >
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quick Links */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-black">
                {t("deals")}
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                {t("newArrivals")}
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                {t("bestSellers")}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - News Carousel (only show on home/all page) */}
      {selectedCategory === "all" && (
        <section className="relative overflow-hidden">
          {newsItems.length > 0 ? (
            <div className="relative">
              <Carousel
                opts={{ loop: true }}
                setApi={setCarouselApi}
                className="w-full"
              >
                <CarouselContent>
                  {newsItems.map((news) => (
                    <CarouselItem key={news.id} className="bg-white">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex min-h-75 flex-col items-center justify-between gap-8 py-12 md:min-h-100 md:flex-row md:py-16">
                          {/* Text on the left */}
                          <div className="flex-1 text-black">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                              {news.title}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                              {news.description}
                            </p>
                            {news.link && (
                              <Button
                                asChild
                                size="lg"
                                className="bg-black text-white hover:bg-gray-800"
                              >
                                <a href={news.link}>{t("buyNow")}</a>
                              </Button>
                            )}
                          </div>
                          {/* Image on the right */}
                          {news.image && (
                            <div className="flex-1 flex justify-center">
                              <img
                                src={news.image}
                                alt={news.title}
                                className="max-w-full h-auto max-h-64 md:max-h-80 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {newsItems.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 border shadow-lg" />
                    <CarouselNext className="right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 border shadow-lg" />
                  </>
                )}
              </Carousel>

              {/* Dots Indicator */}
              {newsItems.length > 1 && totalSlides > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index
                          ? "bg-black"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Default Hero when no news items */
            <div className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-2xl">
                  <Badge className="bg-black text-white mb-4">
                    {t("newArrivals")}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
                    {t("discoverLatestTech")}
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    {t("discoverSubtitle")}
                  </p>
                  <Button
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={() => setSelectedCategory("phone")}
                  >
                    {t("shopPhones")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Only show on "All Products" */}
        {selectedCategory === "all" && (
          <>
            {/* Popular Products */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-bold">{t("popularProducts")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularProducts.length > 0 ? (
                  popularProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center py-12">
                      <p className="text-gray-500">{t("noPopularProducts")}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Best Sellers */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold">{t("bestSellerProducts")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bestSellers.length > 0 ? (
                  bestSellers.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center py-12">
                      <p className="text-gray-500">{t("noBestSellers")}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </>
        )}

        {/* Category Page Layout - Sidebar + Products */}
        {selectedCategory !== "all" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Brand Filter Sidebar - Fixed on scroll */}
            {availableBrands.length > 0 && (
              <aside className="lg:w-56 shrink-0">
                <div className="lg:sticky lg:top-20">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {t("filterByBrand")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedBrand("all")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                            selectedBrand === "all"
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <Package className="h-8 w-8 text-gray-600 mb-1" />
                          <span className="text-xs font-medium">
                            {t("all")}
                          </span>
                        </button>
                        {availableBrands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => setSelectedBrand(brand.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                              selectedBrand === brand.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <img
                              src={
                                failedBrandLogos[brand.id]
                                  ? buildFallbackBrandLogoUrl(brand.name)
                                  : (brand.logo ??
                                    buildFallbackBrandLogoUrl(brand.name))
                              }
                              onError={() => {
                                if (!brand.logo) return;
                                setFailedBrandLogos((prev) =>
                                  prev[brand.id]
                                    ? prev
                                    : { ...prev, [brand.id]: true },
                                );
                              }}
                              alt={brand.name}
                              className="h-8 w-8 rounded-full border bg-white object-contain mb-1"
                            />
                            <span className="text-xs font-medium">
                              {brand.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            )}

            {/* Products Grid */}
            <section className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t("sortBy")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t("priceLowToHigh")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("priceHighToLow")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("mostPopular")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("newest")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("bestRating")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-center">
                        {searchQuery
                          ? t("noSearchResults")
                          : t("noCategoryProducts")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>
        )}

        {/* All Products Grid - Show only on home page */}
        {selectedCategory === "all" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("allProducts")}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t("sortBy")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>{t("priceLowToHigh")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("priceHighToLow")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("mostPopular")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("newest")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("bestRating")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      {searchQuery ? t("noSearchResults") : t("noProductsYet")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (productId: string) => void;
}) {
  const t = useTranslations("Shop");
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleClick = () => {
    router.push(`/users/product/${product.id}`);
  };

  return (
    <Card
      className="group h-full cursor-pointer gap-0 py-0 hover:shadow-lg"
      onClick={handleClick}
    >
      <CardContent className="flex h-full flex-col p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center scale-110 -translate-y-4 group-hover:scale-[1.14] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPopular && (
              <Badge className="bg-orange-500 text-white">{t("popular")}</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-yellow-500 text-black">
                {t("bestSeller")}
              </Badge>
            )}
            {!product.inStock && (
              <Badge className="bg-red-600 text-white">{t("outOfStock")}</Badge>
            )}
          </div>
          {/* Quick View Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col p-4">
          <div className="space-y-1">
            <h3 className="min-h-10 font-medium text-sm line-clamp-2">
              {product.name}
            </h3>
            <p className="min-h-4 text-xs text-gray-500">
              {[product.storage, product.color].filter(Boolean).join(" • ") || (
                <span className="invisible">-</span>
              )}
            </p>
            <p className="min-h-10 text-xs text-gray-600 line-clamp-2">
              {product.description || (
                <span className="invisible">{t("noDescription")}</span>
              )}
            </p>
          </div>

          <div className="mt-auto pt-2">
            {/* Rating */}
            <div className="flex min-h-4 items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="mb-3 mt-2 flex min-h-7 items-center gap-2">
              <span className="text-lg font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice ? (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : (
                <span className="invisible text-sm">.</span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={!product.inStock}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product.id);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? t("addToCart") : t("outOfStock")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
