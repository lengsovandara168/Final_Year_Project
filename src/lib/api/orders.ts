// f:/AUPP/2026/FYP/FYP_Project/src/lib/api/orders.ts

import { apiFetch } from "./client";

export type Order = {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  date: string;
  status: string;
  source?: string;
};

export type GetOrdersResponse = {
  ok: boolean;
  data: Order[];
};

export type CreateOrderItemRequest = {
  productId: string;
  quantity: number;
  unitPrice: number;
  imei?: string;
};

export type CreateOrderPaymentRequest = {
  method: "cash" | "card" | "bakong" | "bank_transfer" | string;
  amount: number;
  reference?: string;
};

export type CreateOrderRequest = {
  customerName?: string;
  customerId?: string;
  items: CreateOrderItemRequest[];
  shippingAmount?: number;
  payments: CreateOrderPaymentRequest[];
  note?: string;
};

export type CreateOrderResponse = {
  ok: boolean;
  data: {
    id: string;
    orderNumber: string;
    createdAt: string;
    paid: number;
    changeDue: number;
  };
};

export type OrderSummaryV2 = {
  orderNumber: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imei?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  subtotal: number;
  shipping: number;
  tradeIns: Array<{
    id: string;
    model: string;
    imei?: string;
    offeredAmount: number;
  }>;
  tradeInTotal: number;
  grandTotal: number;
  payments: Array<{
    id: string;
    method: string;
    amount: number;
    reference?: string;
  }>;
  amountPaid: number;
  changeDue: number;
};

export async function getOrders(accessToken: string) {
  return apiFetch<GetOrdersResponse>("/v1/admin/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getOrderById(accessToken: string, orderId: string) {
  return apiFetch<{ ok: boolean; data: Order }>(`/v1/admin/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createOrder(
  payload: CreateOrderRequest,
  accessToken: string,
) {
  return apiFetch<CreateOrderResponse>("/v1/admin/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
