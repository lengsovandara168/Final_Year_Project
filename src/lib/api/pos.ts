// Stock Management Types for POS

export type StockAdjustmentType = "addition" | "damage" | "loss" | "return" | "adjustment";

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  quantityChange: number; // positive for additions, negative for deductions
  adjustmentType: StockAdjustmentType;
  reason?: string;
  staffId: string;
  staffName?: string;
  timestamp: string;
  notes?: string;
}

export interface StockHistory {
  id: string;
  productId: string;
  productName?: string;
  brand?: string;
  category?: string;
  previousQuantity: number;
  newQuantity: number;
  quantityChange: number;
  adjustmentType: StockAdjustmentType;
  reason?: string;
  staffId: string;
  staffName?: string;
  timestamp: string;
  notes?: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  currentQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export interface AddStockRequest {
  productId: string;
  quantity: number;
  adjustmentType: StockAdjustmentType;
  reason?: string;
  notes?: string;
}

export interface StockAdjustmentResponse {
  ok: boolean;
  message: string;
  data?: StockAdjustment;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetStockHistoryResponse {
  ok: boolean;
  data: StockHistory[];
}

export interface GetStockLevelsResponse {
  ok: boolean;
  data: StockLevel[];
}

// API Client Functions
import { apiFetch } from "./client";

/**
 * Add stock to a product
 */
export async function addStock(
  accessToken: string,
  request: AddStockRequest,
): Promise<StockAdjustmentResponse> {
  return apiFetch<StockAdjustmentResponse>("/v1/pos/stock/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

/**
 * Adjust stock (deduct for damage/loss/returns)
 */
export async function adjustStock(
  accessToken: string,
  request: AddStockRequest,
): Promise<StockAdjustmentResponse> {
  return apiFetch<StockAdjustmentResponse>("/v1/pos/stock/adjust", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

/**
 * Get stock adjustment history (filtered by product or date range)
 */
export async function getStockHistory(
  accessToken: string,
  filters?: {
    productId?: string;
    adjustmentType?: StockAdjustmentType;
    startDate?: string;
    endDate?: string;
  },
): Promise<GetStockHistoryResponse> {
  const params = new URLSearchParams();
  if (filters?.productId) params.append("productId", filters.productId);
  if (filters?.adjustmentType)
    params.append("adjustmentType", filters.adjustmentType);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/pos/stock/history${queryString ? `?${queryString}` : ""}`;

  return apiFetch<GetStockHistoryResponse>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Get current stock levels for all products
 */
export async function getStockLevels(
  accessToken: string,
): Promise<GetStockLevelsResponse> {
  return apiFetch<GetStockLevelsResponse>("/v1/pos/stock/levels", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
