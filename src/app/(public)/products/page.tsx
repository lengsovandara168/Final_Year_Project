"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCard, CategorySidebar } from "@/components/shop";
import { products, categories, getBrandsByCategory } from "@/lib/shop-data";
import { Search, SlidersHorizontal, ChevronRight, Home, Grid3X3, List } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const sortParam = searchParams.get("sort");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(sortParam || "featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get brands for current category
  const availableBrands = useMemo(() => {
    return getBrandsByCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryParam) {
      result = result.filter((p) => p.categorySlug === categoryParam);
    }

    // Filter by brand
    if (brandParam) {
      result = result.filter((p) => p.brand.toLowerCase() === brandParam.toLowerCase());
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.model.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "bestseller":
        result.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case "popular":
        result = result.filter((p) => p.isPopular);
        break;
      default:
        // Featured - no specific sort
        break;
    }

    return result;
  }, [categoryParam, brandParam, searchQuery, sortBy]);

  const currentCategory = categoryParam
    ? categories.find((c) => c.slug === categoryParam)
    : null;

  // Build URL with current params plus new ones
  const buildFilterUrl = (newBrand?: string) => {
    const params = new URLSearchParams();
    if (categoryParam) params.set("category", categoryParam);
    if (newBrand) params.set("brand", newBrand);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        {currentCategory ? (
          <>
            <Link href="/products" className="hover:text-black">
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            {brandParam ? (
              <>
                <Link href={`/products?category=${categoryParam}`} className="hover:text-black">
                  {currentCategory.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-black font-medium">{brandParam}</span>
              </>
            ) : (
              <span className="text-black font-medium">{currentCategory.name}</span>
            )}
          </>
        ) : brandParam ? (
          <>
            <Link href="/products" className="hover:text-black">
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-black font-medium">{brandParam}</span>
          </>
        ) : (
          <span className="text-black font-medium">All Products</span>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {brandParam 
                ? `${brandParam}${currentCategory ? ` ${currentCategory.name}` : ""}`
                : currentCategory 
                  ? currentCategory.name 
                  : "All Products"}
            </h1>
            <p className="text-gray-500">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Filters Bar */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter/Sort/View */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                  <select
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Sort by: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="bestseller">Best Sellers</option>
                  </select>
                  <div className="hidden md:flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon-sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon-sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile Categories & Brands */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 lg:hidden">
                <Link href="/products">
                  <Badge
                    variant={!categoryParam && !brandParam ? "default" : "outline"}
                    className={`whitespace-nowrap cursor-pointer ${
                      !categoryParam && !brandParam ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    All
                  </Badge>
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                    <Badge
                      variant={cat.slug === categoryParam && !brandParam ? "default" : "outline"}
                      className={`whitespace-nowrap cursor-pointer ${
                        cat.slug === categoryParam && !brandParam
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Mobile Brands (when category selected) */}
              {categoryParam && availableBrands.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2 lg:hidden">
                  <Link href={`/products?category=${categoryParam}`}>
                    <Badge
                      variant={!brandParam ? "default" : "outline"}
                      className={`whitespace-nowrap cursor-pointer ${
                        !brandParam ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      All Brands
                    </Badge>
                  </Link>
                  {availableBrands.map(({ brand, count }) => (
                    <Link key={brand} href={buildFilterUrl(brand)}>
                      <Badge
                        variant={brandParam === brand ? "default" : "outline"}
                        className={`whitespace-nowrap cursor-pointer ${
                          brandParam === brand
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {brand} ({count})
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div
              className={`grid gap-4 md:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <p className="text-gray-500 mb-4">No products found.</p>
                <Button asChild variant="outline">
                  <Link href="/products">View All Products</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="default">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
