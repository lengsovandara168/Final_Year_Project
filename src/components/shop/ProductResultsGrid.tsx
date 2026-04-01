"use client";

import type { Product } from "@/lib/api";

import ProductCard from "@/components/shop/ProductCard";
import { Card, CardContent } from "@/components/ui/card";

type ProductResultsGridProps = {
  isSearchActive: boolean;
  isFetching: boolean;
  isError: boolean;
  products: Product[];
  emptyMessage: string;
  columnsClassName?: string;
  onAddToCartAction: (productId: string) => void;
  onWishlistClickAction: (product: Product) => void;
  isWishlistedAction: (productId: string) => boolean;
};

export default function ProductResultsGrid({
  isSearchActive,
  isFetching,
  isError,
  products,
  emptyMessage,
  columnsClassName = "grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4",
  onAddToCartAction,
  onWishlistClickAction,
  isWishlistedAction,
}: ProductResultsGridProps) {
  return (
    <div className={columnsClassName}>
      {isSearchActive && isFetching ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500">Loading results...</p>
          </CardContent>
        </Card>
      ) : isSearchActive && isError ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-red-500">
              Failed to load search results.
            </p>
          </CardContent>
        </Card>
      ) : products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCartAction={onAddToCartAction}
            onWishlistClickAction={onWishlistClickAction}
            isWishlisted={isWishlistedAction(product.id)}
          />
        ))
      ) : (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500">{emptyMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
