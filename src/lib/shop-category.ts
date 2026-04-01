import { ShopCategoryView } from "@/lib/shop.types";

export const SHOP_CATEGORY_VALUES = [
  ShopCategoryView.ALL,
  ShopCategoryView.PHONE,
  ShopCategoryView.TABLET,
  ShopCategoryView.ACCESSORIES,
  ShopCategoryView.OFFER,
] as const;

export function parseShopCategory(value: string | null): ShopCategoryView {
  if (value && SHOP_CATEGORY_VALUES.includes(value as ShopCategoryView)) {
    return value as ShopCategoryView;
  }

  return ShopCategoryView.ALL;
}

export function isAllShopCategory(category: ShopCategoryView) {
  return category === ShopCategoryView.ALL;
}
