"use client";

import { useShop } from "@/contexts/shop-context";
import { ProductCard } from "@/components/shop";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, LogIn } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { 
    wishlist, 
    isAuthenticated, 
    wishlistCount 
  } = useShop();

  // Require authentication to view wishlist
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6">
            <LogIn className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Sign In to View Your Wishlist</h1>
          <p className="text-gray-600 mb-8">
            Please sign in or create an account to save items to your wishlist and access them anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/en/login">
              <Button className="bg-black text-white hover:bg-gray-800 w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/en/register">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">
            Start adding items you love to your wishlist. Click the heart icon on any product to save it here.
          </p>
          <Link href="/products">
            <Button className="bg-black text-white hover:bg-gray-800">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
