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
  userEmail?: string;
  createdAt: string;
  amount: number;
  currency: CheckoutCurrency;
  items: StoredCheckoutItem[];
  shipping: BakongCheckoutShipping;
};

const LAST_ORDER_SUMMARY_KEY = "lastOrderSummary";
const ORDER_HISTORY_KEY = "orderHistory";
const HISTORY_LIMIT = 50;

function parseStoredSummaries(raw: string | null) {
  if (!raw) return [] as StoredCheckoutSummary[];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [] as StoredCheckoutSummary[];
    return parsed as StoredCheckoutSummary[];
  } catch {
    return [] as StoredCheckoutSummary[];
  }
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export function setStoredCheckoutSummary(summary: StoredCheckoutSummary) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_ORDER_SUMMARY_KEY, JSON.stringify(summary));
}

export function persistCheckoutSummary(summary: StoredCheckoutSummary) {
  if (typeof window === "undefined") {
    return;
  }

  setStoredCheckoutSummary(summary);

  const existing = parseStoredSummaries(
    window.localStorage.getItem(ORDER_HISTORY_KEY),
  );

  const deduplicated = existing.filter(
    (item) => item.paymentId !== summary.paymentId,
  );

  const nextHistory = [summary, ...deduplicated].slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(nextHistory));
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

export function getStoredCheckoutHistory(userEmail?: string) {
  if (typeof window === "undefined") {
    return [] as StoredCheckoutSummary[];
  }

  const normalizedTargetEmail = normalizeEmail(userEmail);

  const history = parseStoredSummaries(
    window.localStorage.getItem(ORDER_HISTORY_KEY),
  );

  const filteredHistory = normalizedTargetEmail
    ? history.filter((summary) => {
        const summaryEmail = normalizeEmail(summary.userEmail);
        const shippingEmail = normalizeEmail(summary.shipping?.email);
        return (
          summaryEmail === normalizedTargetEmail ||
          shippingEmail === normalizedTargetEmail
        );
      })
    : history;

  if (filteredHistory.length > 0) {
    return filteredHistory;
  }

  const last = getStoredCheckoutSummary();
  if (!last) return [];

  if (!normalizedTargetEmail) return [last];

  const lastEmail = normalizeEmail(last.userEmail);
  const lastShippingEmail = normalizeEmail(last.shipping?.email);
  return lastEmail === normalizedTargetEmail ||
    lastShippingEmail === normalizedTargetEmail
    ? [last]
    : [];
}
