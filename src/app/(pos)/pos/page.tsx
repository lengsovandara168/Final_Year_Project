"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ShoppingCart, Scan } from "lucide-react";
import Link from "next/link";

// Product categories for quick filter
const categories = [
  { id: "all", name: "All" },
  { id: "phones", name: "Phones" },
  { id: "tablets", name: "Tablets" },
  { id: "accessories", name: "Accessories" },
  { id: "wearables", name: "Wearables" },
];

// Sample products
const products = [
  { id: "1", name: "iPhone 15 Pro Max", price: 1199, stock: 45, category: "phones", image: "📱" },
  { id: "2", name: "Samsung Galaxy S24", price: 899, stock: 32, category: "phones", image: "📱" },
  { id: "3", name: "iPhone 15", price: 799, stock: 28, category: "phones", image: "📱" },
  { id: "4", name: "Pixel 8 Pro", price: 999, stock: 18, category: "phones", image: "📱" },
  { id: "5", name: "iPad Pro 12.9", price: 1099, stock: 23, category: "tablets", image: "📱" },
  { id: "6", name: "Galaxy Tab S9", price: 849, stock: 15, category: "tablets", image: "📱" },
  { id: "7", name: "AirPods Pro", price: 249, stock: 67, category: "accessories", image: "🎧" },
  { id: "8", name: "Galaxy Buds 2 Pro", price: 199, stock: 45, category: "accessories", image: "🎧" },
  { id: "9", name: "Apple Watch Ultra", price: 799, stock: 12, category: "wearables", image: "⌚" },
  { id: "10", name: "Galaxy Watch 6", price: 399, stock: 20, category: "wearables", image: "⌚" },
  { id: "11", name: "MagSafe Charger", price: 39, stock: 100, category: "accessories", image: "🔌" },
  { id: "12", name: "USB-C Cable", price: 19, stock: 200, category: "accessories", image: "🔌" },
];

// Cart state type
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSMainPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Products Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Search & Scan Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Link href="/pos/scan">
            <Button size="lg" variant="outline" className="h-12 px-4">
              <Scan className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-center h-16 text-4xl mb-2">
                  {product.image}
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${product.price}</span>
                  <Badge variant="secondary" className="text-xs">
                    {product.stock}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Sidebar (Desktop) */}
      <div className="hidden lg:flex flex-col w-80 border-l bg-white">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Sale
            {cartItemCount > 0 && (
              <Badge className="ml-auto">{cartItemCount}</Badge>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p>Cart is empty</p>
              <p className="text-sm">Tap products to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setCart((prev) =>
                          prev
                            .map((i) =>
                              i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
                            )
                            .filter((i) => i.quantity > 0)
                        )
                      }
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                          )
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                  <p className="font-bold text-sm w-16 text-right">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          <Link href="/pos/checkout" className="block">
            <Button className="w-full h-12 text-lg" disabled={cart.length === 0}>
              Checkout
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Cart FAB */}
      {cart.length > 0 && (
        <Link
          href="/pos/cart"
          className="lg:hidden fixed bottom-20 right-4 z-40"
        >
          <Button size="lg" className="h-14 px-6 rounded-full shadow-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-bold">${cartTotal}</span>
            <Badge className="ml-2 bg-white text-black">{cartItemCount}</Badge>
          </Button>
        </Link>
      )}
    </div>
  );
}
