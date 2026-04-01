import type {
  BoardCategoryKey,
  BrandLibraryItem,
  ShopNewsTemplate,
  SortOption,
} from "@/lib/shop.types";

export const BRAND_LIBRARY: Record<BoardCategoryKey, BrandLibraryItem[]> = {
  phones: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Google", domain: "google.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Honor", domain: "honor.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "OPPO", domain: "oppo.com" },
    { name: "vivo", domain: "vivo.com" },
    { name: "realme", domain: "realme.com" },
    { name: "Motorola", domain: "motorola.com" },
    { name: "Nokia", domain: "nokia.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Nothing", domain: "nothing.tech" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "ZTE", domain: "zte.com.cn" },
    { name: "Meizu", domain: "meizu.com" },
    { name: "Tecno", domain: "tecno-mobile.com" },
    { name: "Infinix", domain: "infinixmobility.com" },
    { name: "itel", domain: "itel-mobile.com" },
  ],
  tablets: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Huawei", domain: "huawei.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "Lenovo", domain: "lenovo.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Google", domain: "google.com" },
    { name: "ASUS", domain: "asus.com" },
    { name: "Acer", domain: "acer.com" },
    { name: "Dell", domain: "dell.com" },
    { name: "HP", domain: "hp.com" },
  ],
  accessories: [
    { name: "Apple", domain: "apple.com" },
    { name: "Samsung", domain: "samsung.com" },
    { name: "Anker", domain: "anker.com" },
    { name: "Belkin", domain: "belkin.com" },
    { name: "UGREEN", domain: "ugreen.com" },
    { name: "Baseus", domain: "baseus.com" },
    { name: "JBL", domain: "jbl.com" },
    { name: "Sony", domain: "sony.com" },
    { name: "Bose", domain: "bose.com" },
    { name: "Sennheiser", domain: "sennheiser.com" },
    { name: "Beats", domain: "beatsbydre.com" },
    { name: "Logitech", domain: "logitech.com" },
    { name: "Razer", domain: "razer.com" },
    { name: "Spigen", domain: "spigen.com" },
    { name: "OtterBox", domain: "otterbox.com" },
    { name: "ESR", domain: "esrgear.com" },
    { name: "Xiaomi", domain: "mi.com" },
    { name: "OnePlus", domain: "oneplus.com" },
    { name: "Google", domain: "google.com" },
    { name: "Nothing", domain: "nothing.tech" },
  ],
};

export const DEFAULT_BRANDS_BY_CATEGORY = {
  phone: [],
  tablet: [],
  accessories: [],
};

export const SORT_OPTIONS: SortOption[] = [
  "price-low",
  "price-high",
  "popular",
  "newest",
  "rating",
];

export const SHOP_NEWS_TEMPLATES: ShopNewsTemplate[] = [
  {
    id: 1,
    titleKey: "news.iphone17Title",
    descriptionKey: "news.iphone17Description",
    image:
      "https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png",
    link: "#",
  },
  {
    id: 2,
    titleKey: "news.galaxyS25Title",
    descriptionKey: "news.galaxyS25Description",
    image:
      "https://images.samsung.com/lb/smartphones/galaxy-s25-ultra/buy/kv_global_PC_v2.jpg?imbypass=true",
    link: "#",
  },
];
