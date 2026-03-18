// f:/AUPP/2026/FYP/FYP_Project/src/lib/api/dashboard.ts

import { getAdminProducts } from "./products";
import { getAdminCategoryBoard, getCategories } from "./categories";
import { getOrders } from "./orders";
import { getCustomers } from "./customers";

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
  subtitle: string;
  sales: number;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  date?: string;
};

export type OrdersByStatus = Record<string, number>;

export type StockHealth = {
  inStock: number;
  outOfStock: number;
  total: number;
};

export type IncomePoint = {
  period: string;
  revenue: number;
  orders: number;
};

export type IncomeAnalytics = {
  monthly: IncomePoint[];
  yearly: IncomePoint[];
};

export type ProductTypeAnalyticsItem = {
  key: string;
  label: string;
  total: number;
  inStock: number;
  outOfStock: number;
  inStockValue: number;
  outOfStockValue: number;
  totalValue: number;
};

export type DashboardData = {
  stats: DashboardStats;
  topSellingProducts: TopProduct[];
  recentOrders: RecentOrder[];
  ordersByStatus: OrdersByStatus;
  stockHealth: StockHealth;
  incomeAnalytics: IncomeAnalytics;
  productTypeAnalytics: ProductTypeAnalyticsItem[];
};

function parseOrderDate(order: { date?: string; createdAt?: string }) {
  const raw = order.date ?? order.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function orderTotal(order: { total: number | string }) {
  if (typeof order.total === "number") return order.total;
  return parseFloat(order.total) || 0;
}

function buildIncomeAnalytics(
  orders: Array<{ total: number | string; date?: string; createdAt?: string }>,
): IncomeAnalytics {
  const now = new Date();

  const monthKeys: string[] = [];
  const monthlyMap = new Map<string, IncomePoint>();
  for (let i = 11; i >= 0; i -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
    monthlyMap.set(key, { period: key, revenue: 0, orders: 0 });
  }

  const yearKeys: string[] = [];
  const yearlyMap = new Map<string, IncomePoint>();
  for (let year = now.getFullYear() - 4; year <= now.getFullYear(); year += 1) {
    const key = String(year);
    yearKeys.push(key);
    yearlyMap.set(key, { period: key, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const date = parseOrderDate(order);
    if (!date) continue;

    const total = orderTotal(order);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const yearKey = String(date.getFullYear());

    const monthBucket = monthlyMap.get(monthKey);
    if (monthBucket) {
      monthBucket.revenue += total;
      monthBucket.orders += 1;
    }

    const yearBucket = yearlyMap.get(yearKey);
    if (yearBucket) {
      yearBucket.revenue += total;
      yearBucket.orders += 1;
    }
  }

  return {
    monthly: monthKeys.map((key) => monthlyMap.get(key)!),
    yearly: yearKeys.map((key) => yearlyMap.get(key)!),
  };
}

export async function getDashboardData(
  accessToken: string,
): Promise<DashboardData> {
  try {
    const [
      productsResponse,
      categoriesResponse,
      boardResponse,
      ordersResponse,
      customersResponse,
    ] = await Promise.allSettled([
      getAdminProducts(accessToken),
      getCategories(accessToken),
      getAdminCategoryBoard(accessToken),
      getOrders(accessToken),
      getCustomers(accessToken),
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
    const subcategoryNameById = new Map<string, string>();

    if (boardResponse.status === "fulfilled") {
      for (const group of boardResponse.value.data) {
        for (const item of group.items) {
          subcategoryNameById.set(item.id, item.name);
        }
      }
    }

    const DEFAULT_TYPE_KEYS = ["phones", "tablets", "accessories"] as const;
    const subcategoryToGroup = new Map<string, string>();
    const groupLabelByKey = new Map<string, string>();

    if (boardResponse.status === "fulfilled") {
      for (const group of boardResponse.value.data) {
        groupLabelByKey.set(group.key, group.key);
        for (const item of group.items) {
          subcategoryToGroup.set(item.id, group.key);
        }
      }
    }

    // Extract orders data
    const orders =
      ordersResponse.status === "fulfilled" &&
      Array.isArray(ordersResponse.value?.data)
        ? ordersResponse.value.data
        : [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + orderTotal(order);
    }, 0);

    const incomeAnalytics = buildIncomeAnalytics(orders);

    // Extract customers data
    const customers =
      customersResponse.status === "fulfilled" &&
      Array.isArray(customersResponse.value?.data)
        ? customersResponse.value.data
        : [];
    const totalCustomers = customers.length;

    // Calculate stats with real data
    const stats: DashboardStats = {
      totalRevenue,
      revenueChange: 0, // Keep 0 until historical endpoint comparison is available
      products: totalProducts,
      productsChange: 0,
      totalOrders,
      ordersChange: 0,
      customers: totalCustomers,
      customersChange: 0,
    };

    // Generate top products from real data (sales/revenue metrics are placeholders until a product-level aggregation endpoint exists)
    const topSellingProducts: TopProduct[] = products
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        subtitle:
          subcategoryNameById.get(product.subcategoryId) || "Unknown brand",
        sales: 0, // Placeholder
        revenue: 0, // Placeholder
      }));

    // Extract recent orders (top 5) from the real payload
    const recentOrders: RecentOrder[] = orders.slice(0, 5).map((order) => ({
      id: order.id,
      customer: order.customer || order.email || "Unknown",
      items: order.items,
      total:
        typeof order.total === "number"
          ? order.total
          : parseFloat(order.total as string) || 0,
      status: order.status,
      date: order.date,
    }));

    // Compute orders by status
    const ordersByStatus: OrdersByStatus = {};
    for (const order of orders) {
      const status = (order.status ?? "unknown").toLowerCase();
      ordersByStatus[status] = (ordersByStatus[status] ?? 0) + 1;
    }

    // Compute stock health
    const inStockCount = products.filter((p) => p.inStock).length;
    const stockHealth: StockHealth = {
      inStock: inStockCount,
      outOfStock: totalProducts - inStockCount,
      total: totalProducts,
    };

    const productTypeMap = new Map<string, ProductTypeAnalyticsItem>();
    for (const key of DEFAULT_TYPE_KEYS) {
      productTypeMap.set(key, {
        key,
        label: groupLabelByKey.get(key) || key,
        total: 0,
        inStock: 0,
        outOfStock: 0,
        inStockValue: 0,
        outOfStockValue: 0,
        totalValue: 0,
      });
    }

    for (const product of products) {
      const typeKey = subcategoryToGroup.get(product.subcategoryId) || "other";
      if (!productTypeMap.has(typeKey)) {
        productTypeMap.set(typeKey, {
          key: typeKey,
          label: groupLabelByKey.get(typeKey) || typeKey,
          total: 0,
          inStock: 0,
          outOfStock: 0,
          inStockValue: 0,
          outOfStockValue: 0,
          totalValue: 0,
        });
      }

      const bucket = productTypeMap.get(typeKey)!;
      const unitPrice = typeof product.price === "number" ? product.price : 0;
      bucket.total += 1;
      bucket.totalValue += unitPrice;
      if (product.inStock) {
        bucket.inStock += 1;
        bucket.inStockValue += unitPrice;
      } else {
        bucket.outOfStock += 1;
        bucket.outOfStockValue += unitPrice;
      }
    }

    const productTypeAnalytics = Array.from(productTypeMap.values());

    return {
      stats,
      topSellingProducts,
      recentOrders,
      ordersByStatus,
      stockHealth,
      incomeAnalytics,
      productTypeAnalytics,
    };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
}
