"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useAddToCartWithToast } from "@/hooks/use-add-to-cart";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  getProductById,
  getProductGallery,
  getProducts,
  type Product,
} from "@/lib/api";
import { locales } from "@/i18n/routing";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Product type is imported from @/lib/api

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

function normalizeProductImageValues(sources: unknown[]) {
  const collected: string[] = [];

  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const value of source) {
        if (typeof value === "string") {
          collected.push(value);
        }
      }
      continue;
    }

    if (typeof source === "string") {
      const trimmed = source.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed) as unknown;
          if (Array.isArray(parsed)) {
            for (const value of parsed) {
              if (typeof value === "string") {
                collected.push(value);
              }
            }
            continue;
          }
        } catch {
          // Fall through to raw string handling.
        }
      }

      if (trimmed.includes(",")) {
        collected.push(...trimmed.split(","));
        continue;
      }

      collected.push(trimmed);
    }
  }

  return Array.from(
    new Set(collected.map((value) => value.trim()).filter(Boolean)),
  );
}

function resolveProductCoverImage(product: Product | null) {
  if (!product) return undefined;

  const directImage = normalizeProductImageValues([product.image])[0];
  if (directImage) {
    return directImage;
  }

  return normalizeProductImageValues([product.images, product.imageUrls])[0];
}

function extractProductGalleryImages(
  product: Product | null,
  coverImageUrl: string | undefined,
) {
  if (!product) return [] as string[];

  return normalizeProductImageValues([
    product.images,
    product.imageUrls,
  ]).filter((image) => image !== coverImageUrl);
}

function firstImageCollection(...collections: Array<string[] | undefined>) {
  return collections.find(
    (collection) => Array.isArray(collection) && collection.length > 0,
  );
}

function deduplicateProductTemplates(products: Product[]) {
  const stockByTemplate = new Map<string, number>();

  for (const product of products) {
    if (!product.inStock) continue;
    const key = buildProductTemplateKey(product);
    stockByTemplate.set(key, (stockByTemplate.get(key) ?? 0) + 1);
  }

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
      image:
        resolveProductCoverImage(preferred) ||
        resolveProductCoverImage(existing) ||
        resolveProductCoverImage(product),
      images: firstImageCollection(
        preferred.images,
        existing.images,
        product.images,
      ),
      imageUrls: firstImageCollection(
        preferred.imageUrls,
        existing.imageUrls,
        product.imageUrls,
      ),
      description:
        preferred.description || existing.description || product.description,
      storage: preferred.storage || existing.storage || product.storage,
      color: preferred.color || existing.color || product.color,
      price: preferred.price,
      originalPrice: mergedOriginalPrice,
      rating: Math.max(existing.rating, product.rating),
      reviewCount: Math.max(existing.reviewCount, product.reviewCount),
      inStock: existing.inStock || product.inStock,
      availableStock: stockByTemplate.get(key) ?? 0,
      isPopular: Boolean(existing.isPopular || product.isPopular),
      isBestSeller: Boolean(existing.isBestSeller || product.isBestSeller),
    });
  }

  return Array.from(grouped.entries()).map(([key, product]) => ({
    ...product,
    availableStock: product.availableStock ?? stockByTemplate.get(key) ?? 0,
    inStock: (product.availableStock ?? stockByTemplate.get(key) ?? 0) > 0,
  }));
}

function getStockLimit(product: Product | null) {
  if (!product) return 0;

  const candidates = [
    product.availableStock,
    product.stockQuantity,
    product.stock,
    product.quantity,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
  }

  return product.inStock ? Number.POSITIVE_INFINITY : 0;
}

export default function ProductDetailPage() {
  const t = useTranslations("ProductDetail");
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const addToCartWithToast = useAddToCartWithToast();
  const cartCount = getCartCount();
  const [product, setProduct] = useState<Product | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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
        const [response, productsResponse, galleryResponse] = await Promise.all(
          [
            getProductById(accessToken, productId),
            getProducts(accessToken),
            getProductGallery(productId, accessToken).catch((error) => {
              console.error("Failed to load product gallery", error);
              return null;
            }),
          ],
        );
        const loadedProduct = response.data || null;

        const allProducts = productsResponse.data || [];
        const stockByTemplate = new Map<string, number>();

        for (const item of allProducts) {
          if (!item.inStock) continue;
          const key = buildProductTemplateKey(item);
          stockByTemplate.set(key, (stockByTemplate.get(key) ?? 0) + 1);
        }

        const productWithStock = loadedProduct
          ? {
              ...loadedProduct,
              image:
                resolveProductCoverImage(loadedProduct) ?? loadedProduct.image,
              availableStock:
                stockByTemplate.get(buildProductTemplateKey(loadedProduct)) ??
                0,
            }
          : null;

        setProduct(productWithStock);
        setGalleryImages(
          galleryResponse
            ? normalizeProductImageValues([
                galleryResponse.data.map((image) => image.url),
              ])
            : [],
        );
        setSelectedImage(0);

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
        setGalleryImages([]);
        setSelectedImage(0);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProduct();
  }, [params.id, pathname, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.id]);

  useEffect(() => {
    const stockLimit = getStockLimit(product);
    if (stockLimit <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity((current) => Math.max(1, Math.min(current, stockLimit)));
  }, [product]);

  const coverImageUrl = resolveProductCoverImage(product);
  const previewImages = normalizeProductImageValues([
    coverImageUrl ? [coverImageUrl] : [],
    galleryImages.length > 0
      ? galleryImages.filter((image) => image !== coverImageUrl)
      : extractProductGalleryImages(product, coverImageUrl),
  ]);
  const stockLimit = getStockLimit(product);
  const maxQuantity = stockLimit > 0 ? stockLimit : 1;
  const selectedImageUrl =
    previewImages[selectedImage] ?? previewImages[0] ?? null;

  useEffect(() => {
    if (selectedImage >= previewImages.length) {
      setSelectedImage(0);
    }
  }, [previewImages.length, selectedImage]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      const safeQuantity = Math.max(1, Math.min(quantity, maxQuantity));
      addToCartWithToast(product, safeQuantity);
    }
  };

  const handleShareProduct = async () => {
    if (!product || typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}${pathname}`;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied to clipboard");
    } catch {
      toast.error("Unable to share this product link");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-600">
            {t("loading")}
          </h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {t("notFound")}
          </h2>
          <p className="text-gray-500 mb-4">{t("notFoundMessage")}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("goBack")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
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
                  <Badge className="bg-orange-500 text-white">
                    {t("popular")}
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-yellow-500 text-black">
                    {t("bestSeller")}
                  </Badge>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100,
                    )}
                    % OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {previewImages.length > 0 && (
              <div className="rounded-2xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    {t("gallery")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedImage + 1}/{previewImages.length}
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {previewImages.map((image, idx) => (
                    <button
                      key={`${image}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                        selectedImage === idx
                          ? "border-black shadow-sm"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={`${product.name} view ${idx + 1}`}
                          className="h-24 w-24 object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center bg-gray-50">
                          <Package className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                {product.rating} ({product.reviewCount} {t("reviews")})
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
                    {t("save", {
                      amount: formatPrice(
                        product.originalPrice - product.price,
                      ),
                    })}
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
                    <span className="font-medium">{t("inStock")}</span>
                  </div>
                  <span className="text-gray-500">- {t("readyToShip")}</span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-5 w-5" />
                  <span className="font-medium">{t("outOfStock")}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">
                  {t("description")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">
                  {t("quantity")}
                </h2>
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
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(maxQuantity, quantity + 1))
                      }
                      disabled={quantity >= maxQuantity}
                      className="rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-gray-500">
                    {t("total")}{" "}
                    <span className="font-bold text-black">
                      {formatPrice(product.price * quantity)}
                    </span>
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
                {product.inStock ? t("addToCart") : t("outOfStock")}
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => toggleWishlist(product)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted(product.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">{t("freeShipping")}</p>
                <p className="text-xs text-gray-500">{t("freeShippingHint")}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">{t("warranty")}</p>
                <p className="text-xs text-gray-500">{t("warrantyHint")}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium">{t("returnPolicy")}</p>
                <p className="text-xs text-gray-500">{t("returnPolicyHint")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && product.specifications.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t("specifications")}</h2>
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
          <section className="mt-16 pt-12 border-t">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("youMayAlsoLike")}
              </h2>
              <div className="w-12 h-1 bg-black rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    router.push(`/users/product/${relatedProduct.id}`)
                  }
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-visible relative">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Image Section */}
                      <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center">
                        {relatedProduct.image ? (
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-300" />
                        )}
                      </div>

                      {/* Discount Badge - Outside image container */}
                      {relatedProduct.originalPrice && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-red-500 text-white shadow-md font-bold text-xs">
                            {Math.round(
                              (1 - relatedProduct.price / relatedProduct.originalPrice) * 100
                            )}
                            % OFF
                          </Badge>
                        </div>
                      )}
                      {relatedProduct.isPopular && !relatedProduct.originalPrice && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-orange-500 text-white shadow-md text-xs">
                            {t("popular")}
                          </Badge>
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col p-4">
                        {/* Name */}
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 leading-tight">
                          {relatedProduct.name}
                        </h3>

                        {/* Specs */}
                        {(relatedProduct.storage || relatedProduct.color) && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                            {[relatedProduct.storage, relatedProduct.color]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.floor(relatedProduct.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            ({relatedProduct.reviewCount})
                          </span>
                        </div>

                        {/* Price Section */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(relatedProduct.price)}
                              </span>
                              {relatedProduct.originalPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(relatedProduct.originalPrice)}
                                </div>
                              )}
                            </div>
                            {relatedProduct.inStock && (
                              <Button
                                size="sm"
                                className="bg-black text-white hover:bg-gray-800 h-8 px-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCartWithToast(relatedProduct, 1);
                                }}
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">{t("totalPrice")}</p>
            <p className="text-xl font-bold">
              {formatPrice(product.price * quantity)}
            </p>
          </div>
          <Button
            className="flex-1 bg-black text-white hover:bg-gray-800 h-12"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {t("addToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
}
