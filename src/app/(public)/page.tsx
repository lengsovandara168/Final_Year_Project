"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, CategoryNav } from "@/components/shop";
import {
  getPopularProducts,
  getBestSellerProducts,
  products,
} from "@/lib/shop-data";
import { ChevronRight, Truck, Shield, Headphones, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const popularProducts = getPopularProducts();
  const bestSellers = getBestSellerProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <Badge className="bg-white text-black mb-4">New Arrivals</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Discover the Latest Tech
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Shop the newest smartphones, tablets, and accessories from top brands.
              Free shipping on orders over $100.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                <Link href="/products?category=phones">
                  Shop Phones
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">24/7 Support</p>
                <p className="text-xs text-gray-500">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link
            href="/products"
            className="text-sm font-medium hover:underline flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CategoryNav />
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                🔥 Popular Products
              </CardTitle>
              <Link
                href="/products?sort=popular"
                className="text-sm font-medium hover:underline flex items-center"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {popularProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                ⭐ Best Sellers
              </CardTitle>
              <Link
                href="/products?sort=bestseller"
                className="text-sm font-medium hover:underline flex items-center"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* All Products */}
      <section className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl">
                All Products
              </CardTitle>
              <Badge variant="outline">{products.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get the latest updates on new products, exclusive deals, and special offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button className="bg-black text-white hover:bg-gray-800">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
