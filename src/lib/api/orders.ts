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
