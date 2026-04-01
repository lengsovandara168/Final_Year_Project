"use client";

import type { ReactNode } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Product } from "@/lib/api";
import ProductCard from "@/components/shop/ProductCard";

type ProductGridSectionProps = {
  title: string;
  icon?: ReactNode;
  products: Product[];
  emptyMessage: string;
  gridClassName?: string;
  useCarousel?: boolean;
  itemBasisClassName?: string;
  onAddToCartAction: (productId: string) => void;
  onWishlistClickAction: (product: Product) => void;
  isWishlistedAction: (productId: string) => boolean;
};

export default function ProductGridSection({
  title,
  icon,
  products,
  emptyMessage,

  gridClassName = "grid-cols-2 lg:grid-cols-4",
  useCarousel = false,
  itemBasisClassName = "basis-1/2 md:basis-1/3 lg:basis-1/4",
  onAddToCartAction,
  onWishlistClickAction,
  isWishlistedAction,
}: ProductGridSectionProps) {
  const hasProducts = products.length > 0;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      {!hasProducts ? (
        <div className="rounded-2xl border border-dashed bg-white px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : useCarousel ? (
        <Carousel
          opts={{ align: "start", loop: products.length > 4 }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className={`pl-2 md:pl-4 ${itemBasisClassName}`}
              >
                <ProductCard
                  product={product}
                  onAddToCartAction={onAddToCartAction}
                  onWishlistClickAction={onWishlistClickAction}
                  isWishlisted={isWishlistedAction(product.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 hidden -translate-x-1/2 md:flex" />
          <CarouselNext className="right-0 hidden translate-x-1/2 md:flex" />
        </Carousel>
      ) : (
        <div className={`grid gap-4 ${gridClassName}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCartAction={onAddToCartAction}
              onWishlistClickAction={onWishlistClickAction}
              isWishlisted={isWishlistedAction(product.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
