import { apiFetch } from "./client";

export type CheckoutCurrency = "USD" | "KHR";

export type BakongPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired";

export type BakongCheckoutShipping = {
  fullName: string;
  phone: string;
  addressLine1: string;
  notes?: string;
  email?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

export type InitBakongCheckoutRequest = {
  items: Array<{
    productId: string;
  }>;
  shipping: BakongCheckoutShipping;
  currency: CheckoutCurrency;
  note?: string;
};

export type InitBakongCheckoutResponse = {
  ok: true;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: CheckoutCurrency;
  khqr?: string | null;
  khqrString?: string | null;
  qrString?: string | null;
  deeplink?: string | null;
  deepLink?: string | null;
  expiresAt: string;
};

export async function initBakongCheckout(
  payload: InitBakongCheckoutRequest,
  accessToken: string,
) {
  return apiFetch<InitBakongCheckoutResponse>("/v1/checkout/bakong/init", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
    },
    body: JSON.stringify(payload),
  });
}

export type GetBakongPaymentStatusResponse = {
  ok: true;
  status: BakongPaymentStatus;
  orderId?: string;
  paymentId?: string;
  receiptNumber?: string;
};

export async function getBakongPaymentStatus(
  paymentId: string,
  accessToken: string,
) {
  return apiFetch<GetBakongPaymentStatusResponse>(
    `/v1/checkout/bakong/${paymentId}/status`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
}

export type CancelBakongPaymentResponse = {
  ok: boolean;
};

export async function cancelBakongPayment(
  paymentId: string,
  accessToken: string,
) {
  return apiFetch<CancelBakongPaymentResponse>(
    `/v1/checkout/bakong/${paymentId}/cancel`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
}
