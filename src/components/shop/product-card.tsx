"use client";

import { Product, formatPrice } from "@/lib/shop-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: Product;
  showAddToCart?: boolean;
};

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const router = useRouter();
  const { 
    addToCart, 
    isAuthenticated, 
    setIsCartOpen,
    toggleWishlist,
    isInWishlist 
  } = useShop();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push("/en/login");
      return;
    }
    
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push("/en/login");
      return;
    }
    
    toggleWishlist(product);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {/* Product Image Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
              <span className="text-3xl font-bold">
                {product.brand.charAt(0)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPopular && (
              <Badge className="bg-blue-500 text-white">Popular</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-orange-500 text-white">Best Seller</Badge>
            )}
            {discount && (
              <Badge className="bg-red-500 text-white">-{discount}%</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 bg-white/80 hover:bg-white transition-opacity ${
              inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          {/* Quick Add Button - Desktop */}
          {showAddToCart && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                size="sm"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase mb-1">{product.brand}</p>

          {/* Model Name */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-gray-700">
            {product.model}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p
            className={`text-xs mt-2 ${
              product.status === "In Stock"
                ? "text-green-600"
                : product.status === "Low Stock"
                ? "text-orange-500"
                : "text-red-500"
            }`}
          >
            {product.status}
          </p>

          {/* Mobile Add to Cart */}
          {showAddToCart && (
            <Button
              className="w-full mt-3 bg-black text-white hover:bg-gray-800 md:hidden"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
