// Shop data types and mock data

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string; // Path to brand logo image (e.g., "/brands/apple.png")
  description?: string;
};

export type Product = {
  id: number;
  brand: string;
  model: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  stock: number;
  status: "In Stock" | "Out of Stock" | "Low Stock";
  image: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isPopular: boolean;
  isBestSeller: boolean;
  description: string;
  specs: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    battery: string;
  };
};

export type CartItem = {
  product: Product;
  quantity: number;
};

// Categories
export const categories: Category[] = [
  { id: "1", name: "Phones", slug: "phones", icon: "smartphone", productCount: 24 },
  { id: "2", name: "Tablets", slug: "tablets", icon: "tablet", productCount: 12 },
  { id: "3", name: "Accessories", slug: "accessories", icon: "headphones", productCount: 45 },
  { id: "4", name: "Smartwatches", slug: "smartwatches", icon: "watch", productCount: 18 },
  { id: "5", name: "Cases & Covers", slug: "cases", icon: "shield", productCount: 67 },
];

// Brands (Subcategories) - Use external URL links for brand logos
// Example: "https://example.com/logo.png" or CDN links
export const brands: Brand[] = [
  { id: "1", name: "Apple", slug: "apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", description: "Think Different" },
  { id: "2", name: "Samsung", slug: "samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", description: "Do What You Can't" },
  { id: "3", name: "Google", slug: "google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", description: "Made by Google" },
  { id: "4", name: "Nokia", slug: "nokia", logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Nokia_wordmark.svg", description: "Connecting People" },
  { id: "5", name: "Huawei", slug: "huawei", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Huawei_Logo.svg", description: "Make It Possible" },
  { id: "6", name: "Oppo", slug: "oppo", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/OPPO_LOGO_2019.svg", description: "Inspiration Ahead" },
  { id: "7", name: "Xiaomi", slug: "xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg", description: "Innovation for Everyone" },
  { id: "8", name: "OnePlus", slug: "oneplus", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/OnePlus_logo.svg", description: "Never Settle" },
  { id: "9", name: "Sony", slug: "sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg", description: "Be Moved" },
  { id: "10", name: "Spigen", slug: "spigen", logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spigen_logo.svg", description: "Designed for Protection" },
];

// Products
export const products: Product[] = [
  {
    id: 1,
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    modelNumber: "A2848",
    price: 1199,
    originalPrice: 1299,
    category: "Phones",
    categorySlug: "phones",
    stock: 45,
    status: "In Stock",
    image: "/products/iphone-15-pro-max.jpg",
    rating: 4.9,
    reviewCount: 2547,
    soldCount: 5420,
    isPopular: true,
    isBestSeller: true,
    description: "The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.",
    specs: {
      display: "6.7-inch Super Retina XDR",
      processor: "A17 Pro",
      ram: "8GB",
      storage: "256GB",
      battery: "4422mAh",
    },
  },
  {
    id: 2,
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    modelNumber: "SM-S928",
    price: 1299,
    category: "Phones",
    categorySlug: "phones",
    stock: 32,
    status: "In Stock",
    image: "/products/galaxy-s24-ultra.jpg",
    rating: 4.8,
    reviewCount: 1892,
    soldCount: 4230,
    isPopular: true,
    isBestSeller: true,
    description: "Ultimate Galaxy experience with Galaxy AI, 200MP camera, and S Pen included.",
    specs: {
      display: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      battery: "5000mAh",
    },
  },
  {
    id: 3,
    brand: "Apple",
    model: "iPhone 14",
    modelNumber: "A2649",
    price: 699,
    originalPrice: 799,
    category: "Phones",
    categorySlug: "phones",
    stock: 78,
    status: "In Stock",
    image: "/products/iphone-14.jpg",
    rating: 4.7,
    reviewCount: 3241,
    soldCount: 8750,
    isPopular: true,
    isBestSeller: true,
    description: "iPhone 14 with impressive battery life, excellent cameras, and Crash Detection.",
    specs: {
      display: "6.1-inch Super Retina XDR",
      processor: "A15 Bionic",
      ram: "6GB",
      storage: "128GB",
      battery: "3279mAh",
    },
  },
  {
    id: 4,
    brand: "Samsung",
    model: "Galaxy A54",
    modelNumber: "SM-A546",
    price: 449,
    category: "Phones",
    categorySlug: "phones",
    stock: 67,
    status: "In Stock",
    image: "/products/galaxy-a54.jpg",
    rating: 4.5,
    reviewCount: 1567,
    soldCount: 3890,
    isPopular: false,
    isBestSeller: false,
    description: "Awesome is for everyone with premium design and long-lasting battery.",
    specs: {
      display: "6.4-inch Super AMOLED",
      processor: "Exynos 1380",
      ram: "8GB",
      storage: "128GB",
      battery: "5000mAh",
    },
  },
  {
    id: 5,
    brand: "Apple",
    model: "iPad Pro 12.9",
    modelNumber: "MTFP3LL/A",
    price: 1099,
    category: "Tablets",
    categorySlug: "tablets",
    stock: 28,
    status: "In Stock",
    image: "/products/ipad-pro.jpg",
    rating: 4.9,
    reviewCount: 892,
    soldCount: 2150,
    isPopular: true,
    isBestSeller: false,
    description: "Supercharged by M2. iPad Pro is the ultimate iPad experience.",
    specs: {
      display: "12.9-inch Liquid Retina XDR",
      processor: "M2",
      ram: "8GB",
      storage: "256GB",
      battery: "10758mAh",
    },
  },
  {
    id: 6,
    brand: "Samsung",
    model: "Galaxy Tab S9 Ultra",
    modelNumber: "SM-X910",
    price: 1199,
    category: "Tablets",
    categorySlug: "tablets",
    stock: 15,
    status: "In Stock",
    image: "/products/galaxy-tab-s9.jpg",
    rating: 4.7,
    reviewCount: 654,
    soldCount: 1420,
    isPopular: true,
    isBestSeller: false,
    description: "The biggest Galaxy Tab with stunning display and S Pen included.",
    specs: {
      display: "14.6-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 2",
      ram: "12GB",
      storage: "256GB",
      battery: "11200mAh",
    },
  },
  {
    id: 7,
    brand: "Apple",
    model: "AirPods Pro 2",
    modelNumber: "MQD83AM/A",
    price: 249,
    category: "Accessories",
    categorySlug: "accessories",
    stock: 120,
    status: "In Stock",
    image: "/products/airpods-pro.jpg",
    rating: 4.8,
    reviewCount: 4532,
    soldCount: 12500,
    isPopular: true,
    isBestSeller: true,
    description: "AirPods Pro with Active Noise Cancellation and Adaptive Audio.",
    specs: {
      display: "N/A",
      processor: "H2 Chip",
      ram: "N/A",
      storage: "N/A",
      battery: "6 hours",
    },
  },
  {
    id: 8,
    brand: "Samsung",
    model: "Galaxy Buds2 Pro",
    modelNumber: "SM-R510",
    price: 199,
    originalPrice: 229,
    category: "Accessories",
    categorySlug: "accessories",
    stock: 85,
    status: "In Stock",
    image: "/products/galaxy-buds.jpg",
    rating: 4.6,
    reviewCount: 2341,
    soldCount: 6780,
    isPopular: false,
    isBestSeller: false,
    description: "Hi-Fi sound with 360 Audio and enhanced ANC.",
    specs: {
      display: "N/A",
      processor: "Custom",
      ram: "N/A",
      storage: "N/A",
      battery: "5 hours",
    },
  },
  {
    id: 9,
    brand: "Apple",
    model: "Apple Watch Ultra 2",
    modelNumber: "MRF23LL/A",
    price: 799,
    category: "Smartwatches",
    categorySlug: "smartwatches",
    stock: 22,
    status: "In Stock",
    image: "/products/apple-watch-ultra.jpg",
    rating: 4.9,
    reviewCount: 1245,
    soldCount: 3200,
    isPopular: true,
    isBestSeller: false,
    description: "The most rugged and capable Apple Watch ever.",
    specs: {
      display: "49mm Always-On Retina",
      processor: "S9 SiP",
      ram: "1GB",
      storage: "64GB",
      battery: "36 hours",
    },
  },
  {
    id: 10,
    brand: "Samsung",
    model: "Galaxy Watch6 Classic",
    modelNumber: "SM-R960",
    price: 399,
    originalPrice: 449,
    category: "Smartwatches",
    categorySlug: "smartwatches",
    stock: 38,
    status: "In Stock",
    image: "/products/galaxy-watch6.jpg",
    rating: 4.6,
    reviewCount: 987,
    soldCount: 2450,
    isPopular: false,
    isBestSeller: false,
    description: "Classic rotating bezel design with advanced health monitoring.",
    specs: {
      display: "1.5-inch Super AMOLED",
      processor: "Exynos W930",
      ram: "2GB",
      storage: "16GB",
      battery: "425mAh",
    },
  },
  {
    id: 11,
    brand: "Apple",
    model: "MagSafe Charger",
    modelNumber: "MHXH3AM/A",
    price: 39,
    category: "Accessories",
    categorySlug: "accessories",
    stock: 200,
    status: "In Stock",
    image: "/products/magsafe-charger.jpg",
    rating: 4.5,
    reviewCount: 3456,
    soldCount: 15600,
    isPopular: false,
    isBestSeller: true,
    description: "Wireless charger with perfectly aligned magnets for fast charging.",
    specs: {
      display: "N/A",
      processor: "N/A",
      ram: "N/A",
      storage: "N/A",
      battery: "15W Output",
    },
  },
  {
    id: 12,
    brand: "Spigen",
    model: "Tough Armor Case",
    modelNumber: "ACS05763",
    price: 29,
    originalPrice: 39,
    category: "Cases & Covers",
    categorySlug: "cases",
    stock: 150,
    status: "In Stock",
    image: "/products/spigen-case.jpg",
    rating: 4.7,
    reviewCount: 5678,
    soldCount: 18900,
    isPopular: false,
    isBestSeller: true,
    description: "Military-grade protection with built-in kickstand.",
    specs: {
      display: "N/A",
      processor: "N/A",
      ram: "N/A",
      storage: "N/A",
      battery: "N/A",
    },
  },
];

// Helper functions
export const getPopularProducts = () => products.filter((p) => p.isPopular).slice(0, 8);

export const getBestSellerProducts = () => 
  [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);

export const getProductsByCategory = (categorySlug: string) =>
  products.filter((p) => p.categorySlug === categorySlug);

export const getProductById = (id: number) => products.find((p) => p.id === id);

export const getCategoryBySlug = (slug: string) => 
  categories.find((c) => c.slug === slug);

export const formatPrice = (price: number) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

// Get unique brands for a category (or all brands if no category)
export const getBrandsByCategory = (categorySlug?: string | null) => {
  const filteredProducts = categorySlug
    ? products.filter((p) => p.categorySlug === categorySlug)
    : products;
  
  const brandCounts = filteredProducts.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(brandCounts)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
};

// Get all unique brands
export const getAllBrands = () => {
  const brandNames = [...new Set(products.map((p) => p.brand))];
  return brandNames.sort();
};

// Get brand info by name
export const getBrandByName = (name: string) =>
  brands.find((b) => b.name.toLowerCase() === name.toLowerCase());

// Get brand info by slug
export const getBrandBySlug = (slug: string) =>
  brands.find((b) => b.slug === slug);

// Get all brands with product counts per category
export const getBrandsWithCountsByCategory = (categorySlug?: string | null) => {
  const filteredProducts = categorySlug
    ? products.filter((p) => p.categorySlug === categorySlug)
    : products;
  
  const brandCounts = filteredProducts.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(brandCounts)
    .map(([brandName, count]) => {
      const brandInfo = getBrandByName(brandName);
      return {
        brand: brandName,
        slug: brandInfo?.slug || brandName.toLowerCase(),
        logo: brandInfo?.logo || "/brands/default.png",
        count,
      };
    })
    .sort((a, b) => a.brand.localeCompare(b.brand));
};
