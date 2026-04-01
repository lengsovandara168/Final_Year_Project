import type { Product } from "@/lib/api";

type BrandOption = {
  id: string;
  name: string;
};

type BrandMapSource = Record<string, BrandOption[]>;

type SearchableProduct = Pick<
  Product,
  "subcategoryId" | "name" | "storage" | "color" | "description"
>;

type BuildRecommendationsOptions = {
  selectedCategory: string;
  categorySubcategoryIds: string[];
  selectedBrand: string;
  normalizedSearchQuery: string;
  brandNameBySubcategoryId: Map<string, string>;
  limit?: number;
};

export function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

export function buildBrandNameBySubcategoryId(brandsByCategory: BrandMapSource) {
  const map = new Map<string, string>();
  for (const brands of Object.values(brandsByCategory)) {
    for (const brand of brands) {
      map.set(brand.id, brand.name);
    }
  }
  return map;
}

export function matchesCategoryFilter(
  productSubcategoryId: string,
  selectedCategory: string,
  categorySubcategoryIds: string[],
) {
  return (
    selectedCategory === "all" ||
    categorySubcategoryIds.includes(productSubcategoryId)
  );
}

export function matchesBrandFilter(
  productSubcategoryId: string,
  selectedBrand: string,
) {
  return selectedBrand === "all" || productSubcategoryId === selectedBrand;
}

export function matchesProductSearchQuery(
  product: SearchableProduct,
  normalizedSearchQuery: string,
  brandNameBySubcategoryId: Map<string, string>,
) {
  if (normalizedSearchQuery === "") return true;

  const brandName = normalizeSearchText(
    brandNameBySubcategoryId.get(product.subcategoryId) ?? "",
  );

  return (
    normalizeSearchText(product.name).includes(normalizedSearchQuery) ||
    normalizeSearchText(product.storage ?? "").includes(normalizedSearchQuery) ||
    normalizeSearchText(product.color ?? "").includes(normalizedSearchQuery) ||
    normalizeSearchText(product.description ?? "").includes(normalizedSearchQuery) ||
    brandName.includes(normalizedSearchQuery)
  );
}

export function buildSearchRecommendations(
  products: SearchableProduct[],
  {
    selectedCategory,
    categorySubcategoryIds,
    selectedBrand,
    normalizedSearchQuery,
    brandNameBySubcategoryId,
    limit = 8,
  }: BuildRecommendationsOptions,
) {
  if (!normalizedSearchQuery) return [];

  const names = new Set<string>();
  for (const product of products) {
    if (
      !matchesCategoryFilter(
        product.subcategoryId,
        selectedCategory,
        categorySubcategoryIds,
      )
    ) {
      continue;
    }

    if (!matchesBrandFilter(product.subcategoryId, selectedBrand)) continue;

    if (
      !matchesProductSearchQuery(
        product,
        normalizedSearchQuery,
        brandNameBySubcategoryId,
      )
    ) {
      continue;
    }

    const productName = product.name.trim();
    if (!productName) continue;

    names.add(productName);
    if (names.size >= limit) break;
  }

  return Array.from(names);
}
