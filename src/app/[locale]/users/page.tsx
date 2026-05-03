"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/hooks/use-logout";
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
import { Special_Elite } from "next/font/google";
import { locales } from "@/i18n/routing";

// Product type imported from @/lib/api
// Includes: id, name, brand, price, originalPrice, image, subcategory,
// rating, reviewCount, inStock, isPopular, isBestSeller, description, specifications

// Type definitions for categories
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  {
    id: "all",
    name: "All Products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "phone",
    name: "Phones",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: "tablet",
    name: "Tablets",
    icon: <Tablet className="h-4 w-4" />,
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "offer",
    name: "Special Offer",
    icon: <BadgePercent className="h-4 w-4" />,
  },
];

// Type definitions for brands
interface Brand {
  id: string;
  name: string;
  logo?: string; // Brand logo image URL
}

function categoryToBoardKey(category: string) {
  if (category === "phone") return "phones";
  if (category === "tablet") return "tablets";
  if (category === "accessories") return "accessories";
  return null;
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

// mock data of News
const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    description:
      "Experience the future of smartphones with our latest arrival.",
    image:
      "https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png",
    link: "#",
  },
  {
    id: 2,
    title: "Galaxy S25 Ultra",
    description: "Pre-order now and get exclusive accessories.",
    image:
      "https://images.samsung.com/lb/smartphones/galaxy-s25-ultra/buy/kv_global_PC_v2.jpg?imbypass=true",
    link: "#",
  },
];

export default function ShopPage() {
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
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>(
    [],
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-swipe for news carousel
  const nextSlide = useCallback(() => {
    if (newsItems.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % newsItems.length);
    }
  }, []);

  const prevSlide = useCallback(() => {
    if (newsItems.length > 0) {
      setCurrentSlide(
        (prev) => (prev - 1 + newsItems.length) % newsItems.length,
      );
    }
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-swipe effect
  useEffect(() => {
    if (newsItems.length <= 1) return;
    const interval = setInterval(nextSlide, 5000); // Auto-swipe every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

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
              id: item.slug,
              name: item.name,
              logo: item.iconUrl,
            }));
          } else if (group.key === "tablets") {
            nextBrands.tablet = group.items.map((item) => ({
              id: item.slug,
              name: item.name,
              logo: item.iconUrl,
            }));
          } else if (group.key === "accessories") {
            nextBrands.accessories = group.items.map((item) => ({
              id: item.slug,
              name: item.name,
              logo: item.iconUrl,
            }));
          }
        }

        setBrandsByCategory(nextBrands);

        // Fetch products
        const productsResponse = await getProducts(accessToken);
        const allProducts = productsResponse.data || [];
        setProducts(allProducts);
        setPopularProducts(allProducts.filter((p) => p.isPopular));
        setBestSellers(allProducts.filter((p) => p.isBestSeller));
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
  const selectedBrandName =
    selectedBrand === "all"
      ? null
      : (availableBrands
          .find((brand) => brand.id === selectedBrand)
          ?.name.toLowerCase() ?? null);

  // Get all subcategory slugs for the selected category
  const categorySubcategorySlugs =
    selectedCategory !== "all" && brandsByCategory[selectedCategory]
      ? brandsByCategory[selectedCategory].map((b) => b.id.toLowerCase())
      : [];

  // Filter products based on category, brand, and search
  const filteredProducts = products.filter((product) => {
    const productSubcategoryLower = (product.subcategory ?? "").toLowerCase();
    const matchesCategory =
      selectedCategory === "all" ||
      categorySubcategorySlugs.includes(productSubcategoryLower);
    const matchesBrand =
      selectedBrand === "all" ||
      product.subcategory === selectedBrand ||
      productSubcategoryLower === selectedBrand.toLowerCase() ||
      productSubcategoryLower === selectedBrandName;
    const matchesSearch =
      searchQuery === "" ||
      (product.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  // Add to cart handler
  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  // Get cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
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
                Final Shop
              </span>
            </div>

            {/* Full Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search for phones, tablets, accessories..."
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

            {/* Account */}
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
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                        ?.name || "Categories"}
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
              <a href="/" className="text-gray-600 hover:text-black">
                Deals
              </a>
              <a href="/" className="text-gray-600 hover:text-black">
                New Arrivals
              </a>
              <a href="/" className="text-gray-600 hover:text-black">
                Best Sellers
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
              {/* Carousel Container */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {newsItems.map((news) => (
                  <div key={news.id} className="w-full flex-shrink-0 bg-white">
                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 min-h-[300px] md:min-h-[400px] py-12 md:py-16">
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
                              <a href={news.link}>Buy Now</a>
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
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {newsItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg transition-colors border"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6 text-black" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg transition-colors border"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6 text-black" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {newsItems.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {newsItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
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
                    New Arrivals
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
                    Discover the Latest Tech
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Shop the newest smartphones, tablets, and accessories from
                    top brands. Free shipping on orders over $100.
                  </p>
                  <Button
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={() => setSelectedCategory("phone")}
                  >
                    Shop Phones
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
                <h2 className="text-xl font-bold">Popular Products</h2>
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
                      <p className="text-gray-500">
                        No popular products available yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Best Sellers */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold">Best Sellers</h2>
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
                      <p className="text-gray-500">
                        No best sellers available yet.
                      </p>
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
                      <CardTitle className="text-sm">Filter by Brand</CardTitle>
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
                          <span className="text-xs font-medium">All</span>
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
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-8 w-auto object-contain mb-1"
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center mb-1">
                                <span className="text-xs font-bold text-gray-500">
                                  {brand.name.charAt(0)}
                                </span>
                              </div>
                            )}
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
                      Sort by
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem>Most Popular</DropdownMenuItem>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Best Rating</DropdownMenuItem>
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
                          ? "No products found matching your search."
                          : "No products available in this category yet."}
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
              <h2 className="text-xl font-bold">All Products</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort by
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem>Newest</DropdownMenuItem>
                  <DropdownMenuItem>Best Rating</DropdownMenuItem>
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
                      {searchQuery
                        ? "No products found matching your search."
                        : "No products available yet."}
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
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name ?? "Product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPopular && (
              <Badge className="bg-orange-500 text-white">Popular</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-yellow-500 text-black">Best Seller</Badge>
            )}
            {!product.inStock && (
              <Badge className="bg-red-600 text-white">Out of Stock</Badge>
            )}
          </div>
          {/* Quick View Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon-sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.brand ?? "Unknown Brand"}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">
            {product.name ?? "Unknown Product"}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
