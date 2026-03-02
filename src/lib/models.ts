export interface Model {
  name: string;
  slug: string;
}

export interface BrandModels {
  [key: string]: Model[];
}

export const PHONE_MODELS: BrandModels = {
  apple: [
    { name: "iPhone 15", slug: "iphone-15" },
    { name: "iPhone 15 Plus", slug: "iphone-15-plus" },
    { name: "iPhone 15 Pro", slug: "iphone-15-pro" },
    { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max" },
    { name: "iPhone 14", slug: "iphone-14" },
    { name: "iPhone 14 Plus", slug: "iphone-14-plus" },
    { name: "iPhone 14 Pro", slug: "iphone-14-pro" },
    { name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max" },
    { name: "iPhone 13", slug: "iphone-13" },
    { name: "iPhone 13 Mini", slug: "iphone-13-mini" },
    { name: "iPhone 13 Pro", slug: "iphone-13-pro" },
    { name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max" },
  ],
  samsung: [
    { name: "Galaxy S24", slug: "galaxy-s24" },
    { name: "Galaxy S24+", slug: "galaxy-s24-plus" },
    { name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra" },
    { name: "Galaxy S23", slug: "galaxy-s23" },
    { name: "Galaxy S23+", slug: "galaxy-s23-plus" },
    { name: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra" },
    { name: "Galaxy A54", slug: "galaxy-a54" },
    { name: "Galaxy A34", slug: "galaxy-a34" },
    { name: "Galaxy Z Fold5", slug: "galaxy-z-fold5" },
    { name: "Galaxy Z Flip5", slug: "galaxy-z-flip5" },
  ],
  oppo: [
    { name: "Find X7", slug: "find-x7" },
    { name: "Find X6", slug: "find-x6" },
    { name: "Find X6 Pro", slug: "find-x6-pro" },
    { name: "Reno 11", slug: "reno-11" },
    { name: "Reno 10", slug: "reno-10" },
    { name: "A78", slug: "a78" },
    { name: "A58", slug: "a58" },
  ],
  vivo: [
    { name: "X100", slug: "x100" },
    { name: "X100 Pro", slug: "x100-pro" },
    { name: "X90", slug: "x90" },
    { name: "X90 Pro", slug: "x90-pro" },
    { name: "V29", slug: "v29" },
    { name: "V28", slug: "v28" },
    { name: "Y100", slug: "y100" },
  ],
  xiaomi: [
    { name: "14", slug: "xiaomi-14" },
    { name: "14 Ultra", slug: "xiaomi-14-ultra" },
    { name: "13", slug: "xiaomi-13" },
    { name: "13 Ultra", slug: "xiaomi-13-ultra" },
    { name: "13T", slug: "xiaomi-13t" },
    { name: "13T Pro", slug: "xiaomi-13t-pro" },
    { name: "Redmi Note 13", slug: "redmi-note-13" },
    { name: "Redmi 13", slug: "redmi-13" },
  ],
  oneplus: [
    { name: "12", slug: "oneplus-12" },
    { name: "12R", slug: "oneplus-12r" },
    { name: "11", slug: "oneplus-11" },
    { name: "11 Pro", slug: "oneplus-11-pro" },
    { name: "Ace 3", slug: "ace-3" },
  ],
  google: [
    { name: "Pixel 8", slug: "pixel-8" },
    { name: "Pixel 8 Pro", slug: "pixel-8-pro" },
    { name: "Pixel 7a", slug: "pixel-7a" },
    { name: "Pixel 7 Pro", slug: "pixel-7-pro" },
    { name: "Pixel 6a", slug: "pixel-6a" },
  ],
  motorola: [
    { name: "Edge 50 Pro", slug: "edge-50-pro" },
    { name: "Edge 50", slug: "edge-50" },
    { name: "Razr 50", slug: "razr-50" },
    { name: "G54", slug: "moto-g54" },
  ],
  sony: [
    { name: "Xperia 1 VI", slug: "xperia-1-vi" },
    { name: "Xperia 5 VI", slug: "xperia-5-vi" },
    { name: "Xperia 10 VI", slug: "xperia-10-vi" },
  ],
  nothing: [
    { name: "Phone 2", slug: "phone-2" },
    { name: "Phone 1", slug: "phone-1" },
  ],
};

export const TABLET_MODELS: BrandModels = {
  apple: [
    { name: "iPad Pro 12.9\" (2024)", slug: "ipad-pro-12-9-2024" },
    { name: "iPad Pro 11\" (2024)", slug: "ipad-pro-11-2024" },
    { name: "iPad Air 11\" (2024)", slug: "ipad-air-11-2024" },
    { name: "iPad Air 13\" (2024)", slug: "ipad-air-13-2024" },
    { name: "iPad (11th Gen)", slug: "ipad-11th-gen" },
    { name: "iPad Mini 7", slug: "ipad-mini-7" },
  ],
  samsung: [
    { name: "Galaxy Tab S9 Ultra", slug: "galaxy-tab-s9-ultra" },
    { name: "Galaxy Tab S9+", slug: "galaxy-tab-s9-plus" },
    { name: "Galaxy Tab S9", slug: "galaxy-tab-s9" },
    { name: "Galaxy Tab A9 Ultra", slug: "galaxy-tab-a9-ultra" },
    { name: "Galaxy Tab A9", slug: "galaxy-tab-a9" },
  ],
  xiaomi: [
    { name: "Pad 6 Max", slug: "xiaomi-pad-6-max" },
    { name: "Pad 6", slug: "xiaomi-pad-6" },
    { name: "Pad 6 Pro", slug: "xiaomi-pad-6-pro" },
  ],
  lenovo: [
    { name: "Tab M11 Pro", slug: "tab-m11-pro" },
    { name: "Tab P12", slug: "tab-p12" },
    { name: "Yoga Tab 13", slug: "yoga-tab-13" },
  ],
};

export const ACCESSORY_MODELS: BrandModels = {
  apple: [
    { name: "AirPods Pro (2nd Gen)", slug: "airpods-pro-2nd-gen" },
    { name: "AirPods (3rd Gen)", slug: "airpods-3rd-gen" },
    { name: "AirPods Max", slug: "airpods-max" },
    { name: "Apple Watch Series 9", slug: "apple-watch-series-9" },
    { name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2" },
    { name: "MagSafe Charger", slug: "magsafe-charger" },
  ],
  samsung: [
    { name: "Galaxy Buds2 Pro", slug: "galaxy-buds2-pro" },
    { name: "Galaxy Buds FE", slug: "galaxy-buds-fe" },
    { name: "Galaxy Watch 6", slug: "galaxy-watch-6" },
    { name: "Galaxy Watch 6 Classic", slug: "galaxy-watch-6-classic" },
  ],
  jbl: [
    { name: "Tune 750TCINC", slug: "tune-750tcinc" },
    { name: "Flip 6", slug: "flip-6" },
    { name: "Xtreme 3", slug: "xtreme-3" },
  ],
  anker: [
    { name: "Soundcore Space Q45", slug: "soundcore-space-q45" },
    { name: "Soundcore Liberty 4", slug: "soundcore-liberty-4" },
    { name: "Powerbank 26800mAh", slug: "powerbank-26800mah" },
  ],
  sony: [
    { name: "WH-1000XM5", slug: "wh-1000xm5" },
    { name: "WF-1000XM5", slug: "wf-1000xm5" },
    { name: "LinkBuds S", slug: "linkbuds-s" },
  ],
};

export function getModelsByCategory(category: "phones" | "tablets" | "accessories"): BrandModels {
  switch (category) {
    case "phones":
      return PHONE_MODELS;
    case "tablets":
      return TABLET_MODELS;
    case "accessories":
      return ACCESSORY_MODELS;
    default:
      return {};
  }
}

export function getBrandName(key: string): string {
  const nameMap: Record<string, string> = {
    apple: "Apple",
    samsung: "Samsung",
    oppo: "OPPO",
    vivo: "Vivo",
    xiaomi: "Xiaomi",
    oneplus: "OnePlus",
    google: "Google",
    motorola: "Motorola",
    sony: "Sony",
    nothing: "Nothing",
    lenovo: "Lenovo",
    jbl: "JBL",
    anker: "Anker",
  };
  return nameMap[key] || key;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
