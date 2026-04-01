import type { CategoryBoardGroup, Product } from "@/lib/api";
import { BRAND_LIBRARY, DEFAULT_BRANDS_BY_CATEGORY } from "@/lib/shop.constants";
import type {
  BoardCategoryKey,
  Brand,
  BrandsByCategory,
  ShopCategoryId,
  SortOption,
} from "@/lib/shop.types";

type ProductFilterParams = {
  products: Product[];
  selectedCategory: ShopCategoryId;
  selectedBrand: string;
  searchQuery: string;
  brandsByCategory: BrandsByCategory;
};

export function buildSourceBrandLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function findLibraryLogoUrl(group: BoardCategoryKey, brandName: string) {
  const normalized = brandName.trim().toLowerCase();
  const match = BRAND_LIBRARY[group].find(
    (item) => item.name.trim().toLowerCase() === normalized,
  );

  return match ? buildSourceBrandLogoUrl(match.domain) : undefined;
}

export function buildFallbackBrandLogoUrl(name: string) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="#f3f4f6" />
      <text x="32" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#374151">
        ${initial}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function categoryToBoardKey(category: ShopCategoryId) {
  if (category === "phone") return "phones";
  if (category === "tablet") return "tablets";
  if (category === "accessories") return "accessories";
  return null;
}

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

export function normalizeProductImageValues(sources: unknown[]) {
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

    if (typeof source !== "string") continue;
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
        // no-op, keep fallback parsing
      }
    }

    if (trimmed.includes(",")) {
      collected.push(...trimmed.split(","));
      continue;
    }

    collected.push(trimmed);
  }

  return Array.from(
    new Set(collected.map((value) => value.trim()).filter(Boolean)),
  );
}

export function resolveProductCoverImage(product: Product) {
  const directImage = normalizeProductImageValues([product.image])[0];
  if (directImage) return directImage;

  return normalizeProductImageValues([product.images, product.imageUrls])[0];
}

function firstImageCollection(...collections: Array<string[] | undefined>) {
  return collections.find(
    (collection) => Array.isArray(collection) && collection.length > 0,
  );
}

export function deduplicateProductTemplates(products: Product[]) {
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
      originalPrice: preferred.originalPrice ?? (maxOriginalPrice || undefined),
      rating: Math.max(existing.rating, product.rating),
      reviewCount: Math.max(existing.reviewCount, product.reviewCount),
      inStock: existing.inStock || product.inStock,
      availableStock: stockByTemplate.get(key) ?? 0,
      isPopular: Boolean(existing.isPopular || product.isPopular),
      isBestSeller: Boolean(existing.isBestSeller || product.isBestSeller),
    });
  }

  return Array.from(grouped.entries()).map(([key, product]) => {
    const availableStock = product.availableStock ?? stockByTemplate.get(key) ?? 0;
    return {
      ...product,
      availableStock,
      inStock: availableStock > 0,
    };
  });
}

export function mapBrandsByCategory(boardGroups: CategoryBoardGroup[]) {
  const nextBrands: BrandsByCategory = {
    ...DEFAULT_BRANDS_BY_CATEGORY,
  };

  for (const group of boardGroups) {
    if (group.key === "phones") {
      nextBrands.phone = group.items.map((item) => ({
        id: item.id,
        name: item.name,
        logo: item.iconUrl || findLibraryLogoUrl("phones", item.name),
      }));
    } else if (group.key === "tablets") {
      nextBrands.tablet = group.items.map((item) => ({
        id: item.id,
        name: item.name,
        logo: item.iconUrl || findLibraryLogoUrl("tablets", item.name),
      }));
    } else if (group.key === "accessories") {
      nextBrands.accessories = group.items.map((item) => ({
        id: item.id,
        name: item.name,
        logo: item.iconUrl || findLibraryLogoUrl("accessories", item.name),
      }));
    }
  }

  return nextBrands;
}

export function getAvailableBrands(
  selectedCategory: ShopCategoryId,
  brandsByCategory: BrandsByCategory,
): Brand[] {
  if (selectedCategory === "phone") {
    return brandsByCategory.phone;
  }

  if (selectedCategory === "tablet") {
    return brandsByCategory.tablet;
  }

  if (selectedCategory === "accessories") {
    return brandsByCategory.accessories;
  }

  return [];
}

export function filterProducts({
  products,
  selectedCategory,
  selectedBrand,
  searchQuery,
  brandsByCategory,
}: ProductFilterParams) {
  const lowerSearch = searchQuery.trim().toLowerCase();

  const categorySubcategoryIds =
    selectedCategory !== "all" && selectedCategory !== "offer"
      ? (brandsByCategory[selectedCategory] ?? []).map((brand) => brand.id)
      : [];

  return products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all"
        ? true
        : selectedCategory === "offer"
          ? (product.originalPrice ?? 0) > product.price
          : categorySubcategoryIds.includes(product.subcategoryId);

    const matchesBrand =
      selectedBrand === "all" || product.subcategoryId === selectedBrand;

    const matchesSearch =
      !lowerSearch ||
      product.name.toLowerCase().includes(lowerSearch) ||
      (product.storage ?? "").toLowerCase().includes(lowerSearch) ||
      (product.color ?? "").toLowerCase().includes(lowerSearch) ||
      (product.description ?? "").toLowerCase().includes(lowerSearch);

    return matchesCategory && matchesBrand && matchesSearch;
  });
}

export function sortProducts(products: Product[], selectedSort: SortOption) {
  return [...products].sort((a, b) => {
    if (selectedSort === "price-low") return a.price - b.price;
    if (selectedSort === "price-high") return b.price - a.price;

    if (selectedSort === "popular") {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      return b.reviewCount - a.reviewCount;
    }

    if (selectedSort === "rating") {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    }

    return 0;
  });
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
