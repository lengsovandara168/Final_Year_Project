"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/contexts/cart-context";
import { getSessionSnapshot } from "@/lib/auth-session";
import { getProductById, getProducts, type Product } from "@/lib/api";
import { locales } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  Package,
  Minus,
  Plus,
  Check,
  X,
  Truck,
  Shield,
  RotateCcw,
  Heart,
  Share2,
  Smartphone,
  Loader2,
} from "lucide-react";

// Product type is imported from @/lib/api

function buildProductTemplateKey(product: Product) {
  const priceKey = Number(product.price ?? 0).toFixed(2);
  const originalPriceKey =
    product.originalPrice == null ? "none" : Number(product.originalPrice).toFixed(2);

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
    const maxOriginalPrice = Math.max(existing.originalPrice ?? 0, product.originalPrice ?? 0);
    const mergedOriginalPrice = preferred.originalPrice ?? (maxOriginalPrice || undefined);

    grouped.set(key, {
      ...preferred,
      image: preferred.image || existing.image || product.image,
      description: preferred.description || existing.description || product.description,
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
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
        setIsLoading(true);
        const productId = params.id as string;
        const response = await getProductById(accessToken, productId);
        const loadedProduct = response.data || null;
        setProduct(loadedProduct);

        // Fetch related products
        const productsResponse = await getProducts(accessToken);
        const allProducts = productsResponse.data || [];
        const currentTemplateKey = loadedProduct
          ? buildProductTemplateKey(loadedProduct)
          : null;
        const uniqueTemplateProducts = deduplicateProductTemplates(allProducts);
        setRelatedProducts(
          uniqueTemplateProducts
            .filter((p) => {
              if (p.id === productId) return false;
              if (!currentTemplateKey) return true;
              return buildProductTemplateKey(p) !== currentTemplateKey;
            })
            .slice(0, 4),
        );
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProduct();
  }, [params.id, pathname, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-600">Loading product...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-black">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold hidden sm:block">LDHS Shop</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="relative"
                onClick={() => router.push("/users/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-32 w-32 text-gray-300" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isPopular && (
                  <Badge className="bg-orange-500 text-white">Popular</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-yellow-500 text-black">Best Seller</Badge>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images (placeholder for multiple images) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-white ${
                    selectedImage === idx ? "border-black" : "border-gray-200"
                  }`}
                >
                  {product.image && idx === 0 ? (
                    <img
                      src={product.image}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              {(product.storage || product.color) && (
                <p className="text-sm text-gray-500 mt-1">
                  {[product.storage, product.color].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge className="bg-red-100 text-red-600">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">In Stock</span>
                  </div>
                  <span className="text-gray-500">- Ready to ship</span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-5 w-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Quantity</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="rounded-r-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-gray-500">
                    Total: <span className="font-bold text-black">{formatPrice(product.price * quantity)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800 h-12 text-lg"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders $100+</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">1 Year Warranty</p>
                <p className="text-xs text-gray-500">Full coverage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">30 Days Return</p>
                <p className="text-xs text-gray-500">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && product.specifications.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-3 border-b last:border-0"
                  >
                    <span className="text-gray-600">{spec.key}</span>
                    <span className="font-medium text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/users/product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      {relatedProduct.image ? (
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      {(relatedProduct.storage || relatedProduct.color) && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {[relatedProduct.storage, relatedProduct.color].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <p className="text-sm font-bold mt-1">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-xl font-bold">{formatPrice(product.price * quantity)}</p>
          </div>
          <Button
            className="flex-1 bg-black text-white hover:bg-gray-800 h-12"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}