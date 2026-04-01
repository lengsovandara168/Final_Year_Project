"use client";

import { Package } from "lucide-react";
import type { ComponentProps } from "react";

import type { Brand } from "@/lib/shop.types";

import BrandLogo from "@/components/shop/BrandLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BrandSidebarProps = {
  brands: Brand[];
  selectedBrand: string;
  filterByBrandLabel: string;
  allLabel: string;
  onSelectBrandAction: (brandId: string) => void;
  variant?: "desktop" | "drawer";
  className?: string;
};

export default function BrandSidebar({
  brands = [],
  selectedBrand,
  filterByBrandLabel,
  allLabel,
  onSelectBrandAction,
  variant = "desktop",
  className,
}: BrandSidebarProps) {
  if (!Array.isArray(brands) || brands.length === 0) {
    return null;
  }

  const Wrapper = variant === "drawer" ? "div" : "aside";
  const wrapperClassName =
    variant === "drawer" ? className : `shrink-0 lg:w-56 ${className ?? ""}`;

  return (
    <Wrapper className={wrapperClassName}>
      <div className={variant === "desktop" ? "lg:sticky lg:top-20" : ""}>
        <Card className={variant === "drawer" ? "rounded-none border-0 shadow-none" : ""}>
          <CardHeader>
            <CardTitle className="text-sm">{filterByBrandLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSelectBrandAction("all")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
                  selectedBrand === "all"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Package className="mb-1 h-8 w-8 text-gray-600" />
                <span className="text-xs font-medium">{allLabel}</span>
              </button>

              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrandAction(brand.id)}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
                    selectedBrand === brand.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <BrandLogo
                    brand={brand}
                    className="mb-1 h-8 w-8 rounded-full border bg-white object-contain"
                  />
                  <span className="text-xs font-medium">{brand.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}
