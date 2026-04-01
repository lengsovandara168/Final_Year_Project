"use client";

import { useMemo, useState } from "react";

import type { Brand } from "@/lib/shop.types";
import { buildFallbackBrandLogoUrl } from "@/lib/shop.utils";

type BrandLogoProps = {
  brand: Brand;
  className?: string;
};

export default function BrandLogo({ brand, className }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  const src = useMemo(() => {
    if (hasError || !brand.logo) {
      return buildFallbackBrandLogoUrl(brand.name);
    }

    return brand.logo;
  }, [brand.logo, brand.name, hasError]);

  return (
    <img
      src={src}
      alt={brand.name}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
