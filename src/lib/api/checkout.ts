import { apiFetch } from "./client";

export type PaymentMethod = "cash" | "card" | "khqr";

export type PaymentLine = {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
};

export type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imei?: string;
};

export type TradeInItem = {
  id: string;
  model: string;
  imei?: string;
  offeredAmount: number;
};

export type OrderSummaryV2 = {
  orderNumber: string;
  createdAt: string;
  items: CheckoutCartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tradeIns: TradeInItem[];
  tradeInTotal: number;
  grandTotal: number;
  payments: PaymentLine[];
  amountPaid: number;
  changeDue: number;
};

export type CreateOrderRequest = {
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    imei?: string;
  }>;
  shippingAmount: number;
  tradeIns?: Array<{
    model: string;
    imei?: string;
    offeredAmount: number;
  }>;
  payments: Array<{
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }>;
};

export type CreateOrderResponse = {
  ok: boolean;
  data: {
    orderId: string;
    orderNumber: string;
    total: number;
    paid: number;
    changeDue: number;
    createdAt: string;
  };
};

export function normalizeAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

export function generatePaymentLine(
  defaultAmount = 0,
  method: PaymentMethod = "khqr",
): PaymentLine {
  return {
    id: `pay-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    method,
    amount: normalizeAmount(defaultAmount),
  };
}

export function calculatePaymentsTotal(payments: PaymentLine[]) {
  return normalizeAmount(
    payments.reduce((sum, line) => sum + normalizeAmount(line.amount), 0),
  );
}

export function createDraftOrderSummary(params: {
  items: CheckoutCartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tradeIns?: TradeInItem[];
  payments: PaymentLine[];
}): OrderSummaryV2 {
  const tradeIns = params.tradeIns ?? [];
  const tradeInTotal = normalizeAmount(
    tradeIns.reduce((sum, tradeIn) => sum + tradeIn.offeredAmount, 0),
  );

  const grandTotal = normalizeAmount(
    Math.max(params.subtotal + params.shipping - tradeInTotal, 0),
  );

  const amountPaid = calculatePaymentsTotal(params.payments);
  const changeDue = normalizeAmount(Math.max(amountPaid - grandTotal, 0));

  return {
    orderNumber: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    items: params.items,
    shippingAddress: params.shippingAddress,
    subtotal: normalizeAmount(params.subtotal),
    shipping: normalizeAmount(params.shipping),
    tradeIns,
    tradeInTotal,
    grandTotal,
    payments: params.payments.map((line) => ({
      ...line,
      amount: normalizeAmount(line.amount),
    })),
    amountPaid,
    changeDue,
  };
}

/**
 * API integration point for backend checkout.
 * This is intentionally not wired into the UI flow yet until backend contract is finalized.
 */
export async function createOrder(
  payload: CreateOrderRequest,
  accessToken: string,
) {
  const candidateEndpoints = [
    "/v1/checkout/orders",
    "/v1/pos/orders",
    "/v1/admin/orders",
  ] as const;

  let lastError: unknown = null;

  for (const endpoint of candidateEndpoints) {
    try {
      return await apiFetch<CreateOrderResponse>(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastError = error;
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: unknown }).status)
          : undefined;

      if (status !== 404) {
        throw error;
      }
    }
  }

  const detail =
    typeof lastError === "object" && lastError !== null && "message" in lastError
      ? String((lastError as { message?: unknown }).message ?? "")
      : "";

  throw new Error(
    `Create order endpoint not found. Tried: ${candidateEndpoints.join(", ")}${detail ? ` (${detail})` : ""}`,
  );
}
