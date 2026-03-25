"use client";

import type { BakongCheckoutShipping, CheckoutCurrency } from "@/lib/api/checkout";

export type StoredCheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type StoredCheckoutSummary = {
  orderId: string;
  paymentId: string;
  receiptNumber?: string;
  createdAt: string;
  amount: number;
  currency: CheckoutCurrency;
  items: StoredCheckoutItem[];
  shipping: BakongCheckoutShipping;
};

const LAST_ORDER_SUMMARY_KEY = "lastOrderSummary";

export function persistCheckoutSummary(summary: StoredCheckoutSummary) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_ORDER_SUMMARY_KEY, JSON.stringify(summary));
}

export function getStoredCheckoutSummary() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_ORDER_SUMMARY_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCheckoutSummary;
  } catch {
    return null;
  }
}
