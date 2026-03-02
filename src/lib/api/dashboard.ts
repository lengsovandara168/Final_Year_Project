// f:/AUPP/2026/FYP/FYP_Project/src/lib/api/dashboard.ts

import { getProducts } from "./products";
import { getCategories } from "./categories";

export type DashboardStats = {
  totalRevenue: number;
  revenueChange: number;
  products: number;
  productsChange: number;
  totalOrders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
};

export type TopProduct = {
  name: string;
  brand: string;
  sales: number;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: string;
};

export type DashboardData = {
  stats: DashboardStats;
  topSellingProducts: TopProduct[];
  recentOrders: RecentOrder[];
};

/**
 * Aggregates dashboard data from available endpoints.
 * Uses real data from /v1/products and /v1/categories.
 * Mock data for orders/customers until backend implements those endpoints.
 */
export async function getDashboardData(
  accessToken: string,
): Promise<DashboardData> {
  try {
    // Fetch real data from available endpoints
    const [productsResponse, categoriesResponse] = await Promise.allSettled([
      getProducts(accessToken),
      getCategories(accessToken),
    ]);

    // Extract products data
    const products =
      productsResponse.status === "fulfilled"
        ? productsResponse.value.data
        : [];
    const totalProducts = products.length;

    // Extract categories data
    const categories =
      categoriesResponse.status === "fulfilled" ? categoriesResponse.value : [];
    const totalCategories = categories.length;

    // Calculate stats with real product data
    const stats: DashboardStats = {
      totalRevenue: 0, // TODO: Will be real when backend adds revenue endpoint
      revenueChange: 0,
      products: totalProducts,
      productsChange: 0, // TODO: Calculate when we have historical data
      totalOrders: 0, // TODO: Will be real when backend adds /v1/admin/orders
      ordersChange: 0,
      customers: 0, // TODO: Will be real when backend adds /v1/admin/customers
      customersChange: 0,
    };

    // Generate top products from real data
    const topSellingProducts: TopProduct[] = products
      .slice(0, 5)
      .map((product, index) => ({
        name: product.name,
        brand: product.brand,
        sales: Math.max(50 - index * 5, 10), // Mock sales data
        revenue: product.price * Math.max(50 - index * 5, 10),
      }));

    // Mock recent orders (will be replaced when backend implements orders endpoint)
    const recentOrders: RecentOrder[] = [
      {
        id: "#ORD-001",
        customer: "Coming Soon",
        items: 0,
        total: 0,
        status: "pending",
      },
    ];

    return {
      stats,
      topSellingProducts,
      recentOrders,
    };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
}
