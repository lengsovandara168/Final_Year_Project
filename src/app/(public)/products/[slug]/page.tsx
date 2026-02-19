"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/shop";
import {
  getProductById,
  getProductsByCategory,
  formatPrice,
} from "@/lib/shop-data";
import { useShop } from "@/contexts/shop-context";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Home,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const productId = parseInt(slug);
  const product = getProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const {
    addToCart,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
    setPendingAction,
    setIsCartOpen,
  } = useShop();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-6">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setPendingAction(() => () => {
        for (let i = 0; i < quantity; i++) {
          addToCart(product);
        }
        setIsCartOpen(true);
      });
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setPendingAction(() => () => {
        for (let i = 0; i < quantity; i++) {
          addToCart(product);
        }
        window.location.href = "/checkout";
      });
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    window.location.href = "/checkout";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto">
        <Link
          href="/"
          className="hover:text-black flex items-center gap-1 whitespace-nowrap"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <Link
          href={`/products?category=${product.categorySlug}`}
          className="hover:text-black whitespace-nowrap"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <span className="text-black font-medium truncate">{product.model}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="space-y-4">
          <Card className="aspect-square flex items-center justify-center bg-gray-100">
            <CardContent className="p-8">
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gray-200 text-gray-400 mx-auto">
                <span className="text-6xl font-bold">
                  {product.brand.charAt(0)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Thumbnail placeholder */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className={`w-20 h-20 rounded-md border-2 flex items-center justify-center bg-gray-100 ${
                  i === 1 ? "border-black" : "border-transparent"
                }`}
              >
                <span className="text-xl font-bold text-gray-400">
                  {product.brand.charAt(0)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 uppercase">{product.brand}</span>
            {product.isPopular && (
              <Badge className="bg-blue-500 text-white">Popular</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-orange-500 text-white">Best Seller</Badge>
            )}
            {discount && (
              <Badge className="bg-red-500 text-white">-{discount}% OFF</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold">{product.model}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-gray-500">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              {product.soldCount.toLocaleString()} sold
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600">{product.description}</p>

          {/* Stock Status */}
          <div
            className={`flex items-center gap-2 ${
              product.status === "In Stock"
                ? "text-green-600"
                : product.status === "Low Stock"
                ? "text-orange-500"
                : "text-red-500"
            }`}
          >
            <Check className="h-5 w-5" />
            <span className="font-medium">{product.status}</span>
            {product.stock > 0 && (
              <span className="text-gray-500">
                - {product.stock} units available
              </span>
            )}
          </div>

          <Separator />

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-black text-white hover:bg-gray-800"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.status === "Out of Stock"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleBuyNow}
              disabled={product.status === "Out of Stock"}
            >
              Buy Now
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-5 w-5 text-gray-500" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-gray-500" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-5 w-5 text-gray-500" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Display</span>
              <span className="font-medium">{product.specs.display}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Processor</span>
              <span className="font-medium">{product.specs.processor}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">RAM</span>
              <span className="font-medium">{product.specs.ram}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Storage</span>
              <span className="font-medium">{product.specs.storage}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Battery</span>
              <span className="font-medium">{product.specs.battery}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Model Number</span>
              <span className="font-medium">{product.modelNumber}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Related Products</CardTitle>
              <Link
                href={`/products?category=${product.categorySlug}`}
                className="text-sm font-medium hover:underline flex items-center"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
