import { apiFetch } from "./client";

export interface PosCatalogItem {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  imei?: string;
  brand?: string;
  category?: string;
  image?: string;
}

export interface PosProductListResponse {
  ok: boolean;
  data: PosCatalogItem[];
}

export interface PosCheckoutItem {
  productId: string;
  quantity: number;
}

export interface PosCustomer {
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface PosCheckoutRequest {
  items: PosCheckoutItem[];
  paymentMethod: "bakong" | "cash";
  customer?: PosCustomer;
  note?: string;
}

export interface PosCheckoutResult {
  receiptId?: string;
  orderNumber?: string;
  paymentId?: string;
  qrString?: string;
  status: string;
}

export interface PosCheckoutResponse {
  ok: boolean;
  data: PosCheckoutResult;
}

export interface PosPaymentStatusPayload {
  status?: string;
  paymentId?: string;
  orderId?: string;
  orderNumber?: string;
  receiptNumber?: string;
}

export interface PosPaymentStatusResponse {
  ok: boolean;
  status?: string;
  paymentId?: string;
  orderNumber?: string;
  receiptNumber?: string;
  data?: PosPaymentStatusPayload;
}

export interface CancelPosPaymentResponse {
  ok: boolean;
}

export interface StockLevel {
  id: string;
  productName: string;
  brand: string;
  category: string;
  currentQuantity: number;
  minQuantity?: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

export interface PosReceiptSummary {
  id: string;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  itemsCount?: number;
}

export interface PosReceiptHistoryResponse {
  ok: boolean;
  data: PosReceiptSummary[];
}

export interface PosSaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imei?: string;
  image?: string;
}

export interface PosCashier {
  id: string;
  name: string;
}

export interface PosReceiptDetail {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  items: PosSaleItem[];
  customer?: PosCustomer;
  cashier?: PosCashier;
}

export interface PosReceiptDetailResponse {
  ok: boolean;
  data: PosReceiptDetail;
}

export async function getPosProducts(
  accessToken: string,
): Promise<PosProductListResponse> {
  return apiFetch<PosProductListResponse>("/v1/pos/products", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function createPosCheckout(
  request: PosCheckoutRequest,
  accessToken: string,
): Promise<PosCheckoutResponse> {
  return apiFetch<PosCheckoutResponse>("/v1/pos/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export async function getPosPaymentStatus(
  paymentId: string,
  accessToken: string,
): Promise<PosPaymentStatusResponse> {
  return apiFetch<PosPaymentStatusResponse>(
    `/v1/pos/payments/${paymentId}/status`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export async function cancelPosPayment(
  paymentId: string,
  accessToken: string,
): Promise<CancelPosPaymentResponse> {
  return apiFetch<CancelPosPaymentResponse>(
    `/v1/pos/payments/${paymentId}/cancel`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export async function getPosReceipts(
  accessToken: string,
): Promise<PosReceiptHistoryResponse> {
  return apiFetch<PosReceiptHistoryResponse>("/v1/pos/receipts", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getPosReceiptDetail(
  receiptId: string,
  accessToken: string,
): Promise<PosReceiptDetailResponse> {
  return apiFetch<PosReceiptDetailResponse>(`/v1/pos/receipts/${receiptId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
