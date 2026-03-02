// f:/AUPP/2026/FYP/FYP_Project/src/lib/api/customers.ts

import { apiFetch } from "./client";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
};

export type GetCustomersResponse = {
  ok: boolean;
  data: Customer[];
};

export async function getCustomers(accessToken: string) {
  return apiFetch<GetCustomersResponse>("/v1/admin/customers", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getCustomerById(accessToken: string, customerId: string) {
  return apiFetch<{ ok: boolean; data: Customer }>(
    `/v1/admin/customers/${customerId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}
