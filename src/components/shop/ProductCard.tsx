"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Eye, Heart, Package, ShoppingCart, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Product } from "@/lib/api";
import { formatPrice, resolveProductCoverImage } from "@/lib/shop.utils";

type ProductCardProps = {
  product: Product;
  isWishlisted: boolean;
  onAddToCartAction: (productId: string) => void;
  onWishlistClickAction: (product: Product) => void;
};

export default function ProductCard({
  product,
  isWishlisted,
  onAddToCartAction,
  onWishlistClickAction,
}: ProductCardProps) {
  const t = useTranslations("Shop");
  const router = useRouter();

  const handleClick = () => {
    router.push(`/users/product/${product.id}`);
  };

  const imageUrl = resolveProductCoverImage(product);

  return (
    <Card
      className="group h-full cursor-pointer gap-0 py-0 hover:shadow-lg"
      onClick={handleClick}
    >
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-white">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-center p-5 transition-transform duration-300 group-hover:scale-[1.03] sm:p-6"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-1">
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

          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                handleClick();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
          <div className="min-w-0 space-y-1">
            <h3 className="min-h-8 wrap-break-word text-xs font-medium line-clamp-2 sm:min-h-10 sm:text-sm">
              {product.name}
            </h3>
            <p className="min-h-3 wrap-break-word text-[11px] text-gray-500 line-clamp-1 sm:min-h-4 sm:text-xs">
              {[product.storage, product.color].filter(Boolean).join(" • ") || (
                <span className="invisible">-</span>
              )}
            </p>
            <p className="hidden min-h-10 wrap-break-word text-xs text-gray-600 line-clamp-2 sm:block">
              {product.description || (
                <span className="invisible">{t("noDescription")}</span>
              )}
            </p>
          </div>

          <div className="mt-auto pt-1.5 sm:pt-2">
            <div className="flex min-h-4 items-center gap-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${product.id}-star-${index}`}
                    className={`h-3 w-3 ${
                      index < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            <div className="mb-2 mt-1.5 flex min-h-6 items-center gap-1.5 sm:mb-3 sm:mt-2 sm:min-h-7 sm:gap-2">
              <span className="text-sm font-bold sm:text-lg">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice ? (
                <span className="text-xs text-gray-500 line-through sm:text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : (
                <span className="invisible text-xs sm:text-sm">.</span>
              )}
            </div>

            <div className="flex items-stretch gap-1.5 sm:gap-2 justify-end">
              <Button
                variant="outline"
                className="h-9 w-9 shrink-0 p-0 sm:h-10 sm:w-10"
                onClick={(event) => {
                  event.stopPropagation();
                  onWishlistClickAction(product);
                }}
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>

              <Button
                className="h-9 w-9 shrink-0 bg-black p-0 text-white hover:bg-gray-800 sm:h-10 sm:min-w-0 sm:flex-1 sm:px-3 sm:text-sm"
                disabled={!product.inStock}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToCartAction(product.id);
                }}
                aria-label={product.inStock ? t("addToCart") : t("outOfStock")}
              >
                <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden truncate sm:inline">
                  {product.inStock ? t("addToCart") : t("outOfStock")}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
