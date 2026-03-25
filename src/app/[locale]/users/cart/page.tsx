"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/contexts/cart-context";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  cancelBakongPayment,
  getBakongPaymentStatus,
  getProducts,
  initBakongCheckout,
  type ApiError,
  type BakongCheckoutShipping,
  type CheckoutCurrency,
  type InitBakongCheckoutResponse,
  type Product,
} from "@/lib/api";
import { persistCheckoutSummary } from "@/lib/checkout-storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { KhqrCode } from "@/components/khqr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Clock3,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

type CheckoutStep = "cart" | "shipping" | "payment";
type PaymentUiState =
  | "idle"
  | "initializing"
  | "ready"
  | "paid"
  | "failed"
  | "expired"
  | "error";

type PaymentSession = {
  ok: true;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: CheckoutCurrency;
  qrString: string;
  deeplink: string | null;
  expiresAt: string;
};

const BAKONG_BILL_NAME_MAX_LENGTH = 25;

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}

function formatPrice(amount: number, currency: CheckoutCurrency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatCountdown(remainingMs: number | null) {
  if (remainingMs === null) {
    return "--:--";
  }

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeBakongInitResponse(
  value: InitBakongCheckoutResponse,
): PaymentSession | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { ok, orderId, paymentId, amount, currency, expiresAt } = value;
  const resolvedQrString =
    typeof value.qrString === "string"
      ? value.qrString
      : typeof value.khqrString === "string"
        ? value.khqrString
        : typeof value.khqr === "string"
          ? value.khqr
          : null;
  const resolvedDeeplink =
    typeof value.deeplink === "string"
      ? value.deeplink
      : typeof value.deepLink === "string"
        ? value.deepLink
        : null;

  if (
    ok !== true ||
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof amount !== "number" ||
    (currency !== "USD" && currency !== "KHR") ||
    typeof resolvedQrString !== "string" ||
    typeof expiresAt !== "string"
  ) {
    return null;
  }

  return {
    ok,
    orderId,
    paymentId,
    amount,
    currency,
    qrString: resolvedQrString,
    deeplink: resolvedDeeplink,
    expiresAt,
  };
}

function buildProductTemplateKey(product: Product) {
  const priceKey = Number(product.price ?? 0).toFixed(2);
  const originalPriceKey =
    product.originalPrice == null
      ? "none"
      : Number(product.originalPrice).toFixed(2);

  if (product.templateId?.trim()) {
    return `template:${product.templateId.trim()}:price:${priceKey}:original:${originalPriceKey}`;
  }

  const normalizedName = product.name.trim().toLowerCase();
  const normalizedStorage = product.storage?.trim().toLowerCase() ?? "";
  const normalizedColor = product.color?.trim().toLowerCase() ?? "";
  return `legacy:${product.subcategoryId}:${normalizedName}:${normalizedStorage}:${normalizedColor}:price:${priceKey}:original:${originalPriceKey}`;
}

function buildInventoryBuckets(products: Product[]) {
  const buckets = new Map<string, Product[]>();

  for (const product of products) {
    if (!product.inStock) continue;
    const key = buildProductTemplateKey(product);
    const current = buckets.get(key) ?? [];
    buckets.set(key, [...current, product]);
  }

  return buckets;
}

function allocateCheckoutItems(
  cartItems: ReturnType<typeof useCart>["items"],
  products: Product[],
) {
  const buckets = buildInventoryBuckets(products);
  const checkoutItems: { productId: string }[] = [];
  const outOfStockNames: string[] = [];
  const stockByCartProductId: Record<string, number> = {};

  for (const item of cartItems) {
    const key = buildProductTemplateKey(item.product);
    const bucket = buckets.get(key) ?? [];
    stockByCartProductId[item.product.id] = bucket.length;

    if (bucket.length <= 0) {
      outOfStockNames.push(item.product.name);
      continue;
    }

    if (item.quantity > bucket.length) {
      outOfStockNames.push(item.product.name);
    }

    const reserveCount = Math.min(item.quantity, bucket.length);
    const selected = bucket.slice(0, reserveCount);
    buckets.set(key, bucket.slice(reserveCount));

    for (const selectedProduct of selected) {
      checkoutItems.push({ productId: selectedProduct.id });
    }
  }

  return {
    checkoutItems,
    outOfStockNames: Array.from(new Set(outOfStockNames)),
    stockByCartProductId,
  };
}

function initialShippingState(): BakongCheckoutShipping {
  return {
    fullName: "",
    phone: "",
    addressLine1: "",
    notes: "",
  };
}

function normalizeBillName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isValidBillName(value: string) {
  const normalized = normalizeBillName(value);
  return (
    normalized.length > 0 && normalized.length <= BAKONG_BILL_NAME_MAX_LENGTH
  );
}

function isShippingComplete(shipping: BakongCheckoutShipping) {
  return (
    shipping.fullName.trim() &&
    shipping.phone.trim() &&
    shipping.addressLine1.trim()
  );
}

function isPendingPaymentState(state: PaymentUiState) {
  return ["initializing", "ready"].includes(state);
}

function getCartItemStockLimit(item: ReturnType<typeof useCart>["items"][number]) {
  const product = item.product;
  const candidates = [
    product.availableStock,
    product.stockQuantity,
    product.stock,
    product.quantity,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
  }

  return product.inStock ? Number.POSITIVE_INFINITY : 0;
}

export default function CartPage() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const isMobile = useIsMobile();
  const { items, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [shipping, setShipping] =
    useState<BakongCheckoutShipping>(initialShippingState);
  const [showErrors, setShowErrors] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentUiState>("idle");
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(
    null,
  );
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [cancelInFlight, setCancelInFlight] = useState(false);
  const [stockByCartProductId, setStockByCartProductId] = useState<
    Record<string, number>
  >({});
  const [outOfStockNames, setOutOfStockNames] = useState<string[]>([]);

  const isItemOutOfStock = (item: ReturnType<typeof useCart>["items"][number]) => {
    const liveStockLimit = stockByCartProductId[item.product.id];
    const stockLimit =
      typeof liveStockLimit === "number"
        ? liveStockLimit
        : getCartItemStockLimit(item);

    return stockLimit <= 0;
  };

  const stepOrder: CheckoutStep[] = ["cart", "shipping", "payment"];
  const subtotal = items.reduce((total, item) => {
    if (isItemOutOfStock(item)) {
      return total;
    }

    return total + item.product.price * item.quantity;
  }, 0);
  const estimatedShipping = 0;
  const estimatedTotal = subtotal + estimatedShipping;
  const readyForShipping = items.length > 0;
  const readyForPayment =
    Boolean(isShippingComplete(shipping)) && isValidBillName(shipping.fullName);
  const maxAvailableStepIndex = readyForPayment ? 2 : readyForShipping ? 1 : 0;
  const actionLabel =
    paymentSession?.deeplink && isMobile ? "Open Bakong" : "I have paid";
  const normalizedBillName = normalizeBillName(shipping.fullName);
  const hasOutOfStockItems = outOfStockNames.length > 0;

  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const statusRequestInFlightRef = useRef(false);
  const initRequestInFlightRef = useRef(false);
  const lastCountdownTriggerRef = useRef<string | null>(null);
  const paymentSessionRef = useRef<PaymentSession | null>(null);
  const paymentStateRef = useRef<PaymentUiState>("idle");

  useEffect(() => {
    paymentSessionRef.current = paymentSession;
  }, [paymentSession]);

  useEffect(() => {
    paymentStateRef.current = paymentState;
  }, [paymentState]);

  function stopPolling() {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }

  function stopCountdown() {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }

  async function redirectToLogin() {
    const nextPath =
      typeof window === "undefined" ? "/users/cart" : window.location.pathname;
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  async function ensureAccessToken() {
    const accessToken = getSessionSnapshot().accessToken;
    if (accessToken) {
      return accessToken;
    }

    await redirectToLogin();
    return null;
  }

  function clearPaymentAttemptState() {
    stopPolling();
    stopCountdown();
    statusRequestInFlightRef.current = false;
    lastCountdownTriggerRef.current = null;
    setPaymentSession(null);
    setRemainingMs(null);
    setCheckoutError(null);
    setPaymentState("idle");
  }

  async function syncCartStock(accessToken: string) {
    const productsResponse = await getProducts(accessToken);
    const allProducts = productsResponse.data || [];
    const allocation = allocateCheckoutItems(items, allProducts);

    setStockByCartProductId(allocation.stockByCartProductId);
    setOutOfStockNames(allocation.outOfStockNames);

    for (const item of items) {
      const limit = allocation.stockByCartProductId[item.product.id];
      if (typeof limit !== "number") continue;
      if (limit > 0 && item.quantity > limit) {
        updateQuantity(item.product.id, limit);
      }
    }

    return allocation;
  }

  function startCountdown(expiresAt: string, paymentId: string) {
    stopCountdown();

    const updateCountdown = () => {
      const expiresAtMs = new Date(expiresAt).getTime();
      const nextRemainingMs = Math.max(0, expiresAtMs - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs > 0) {
        return;
      }

      stopCountdown();

      if (lastCountdownTriggerRef.current === paymentId) {
        return;
      }

      lastCountdownTriggerRef.current = paymentId;
      void checkPaymentStatus(paymentId);
    };

    updateCountdown();
    countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);
  }

  function startPolling(paymentId: string) {
    stopPolling();
    pollIntervalRef.current = window.setInterval(() => {
      void checkPaymentStatus(paymentId);
    }, 3000);
  }

  async function persistAndRedirectToSuccess(status: {
    orderId?: string;
    paymentId?: string;
    receiptNumber?: string;
  }) {
    const currentSession = paymentSessionRef.current;
    if (!currentSession) {
      return;
    }

    const orderId = status.orderId ?? currentSession.orderId;
    const paymentId = status.paymentId ?? currentSession.paymentId;
    const params = new URLSearchParams({
      orderId,
      paymentId,
    });

    if (status.receiptNumber) {
      params.set("receiptNumber", status.receiptNumber);
    }

    persistCheckoutSummary({
      orderId,
      paymentId,
      receiptNumber: status.receiptNumber,
      createdAt: new Date().toISOString(),
      amount: currentSession.amount,
      currency: currentSession.currency,
      items: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      shipping,
    });

    clearCart();
    router.push(`/users/cart/success?${params.toString()}`);
  }

  async function checkPaymentStatus(paymentId: string) {
    if (statusRequestInFlightRef.current) {
      return;
    }

    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      return;
    }

    statusRequestInFlightRef.current = true;

    try {
      const response = await getBakongPaymentStatus(paymentId, accessToken);

      if (response.status === "pending") {
        setPaymentState("ready");
        return;
      }

      stopPolling();
      stopCountdown();

      if (response.status === "paid") {
        setPaymentState("paid");
        await persistAndRedirectToSuccess(response);
        return;
      }

      if (response.status === "failed") {
        setPaymentState("failed");
        setCheckoutError(
          "Payment failed. Please start a fresh Bakong payment.",
        );
        return;
      }

      setPaymentState("expired");
      setCheckoutError("QR expired. Generate a new QR to continue.");
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        await redirectToLogin();
        return;
      }

      setPaymentState("ready");
    } finally {
      statusRequestInFlightRef.current = false;
    }
  }

  async function startBakongPayment() {
    if (
      initRequestInFlightRef.current ||
      paymentStateRef.current === "initializing" ||
      paymentSessionRef.current !== null
    ) {
      return;
    }

    if (items.length === 0) {
      setStep("cart");
      return;
    }

    initRequestInFlightRef.current = true;
    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      initRequestInFlightRef.current = false;
      return;
    }

    setCheckoutError(null);
    setPaymentState("initializing");
    setPaymentSession(null);
    setRemainingMs(null);
    lastCountdownTriggerRef.current = null;

    try {
      const allocation = await syncCartStock(accessToken);
      if (allocation.outOfStockNames.length > 0) {
        setStep("shipping");
        setPaymentState("idle");
        setCheckoutError(
          `Out of stock: ${allocation.outOfStockNames.join(", ")}. Please update your cart quantities.`,
        );
        return;
      }

      if (allocation.checkoutItems.length < 1) {
        setStep("cart");
        setPaymentState("idle");
        setCheckoutError("No in-stock items available for checkout.");
        return;
      }

      const response = await initBakongCheckout(
        {
          items: allocation.checkoutItems,
          shipping: {
            fullName: normalizedBillName,
            phone: shipping.phone.trim(),
            addressLine1: shipping.addressLine1.trim(),
            notes: shipping.notes?.trim() || undefined,
          },
          currency: "USD",
          note: shipping.notes?.trim() || undefined,
        },
        accessToken,
      );

      const normalizedResponse = normalizeBakongInitResponse(response);
      if (!normalizedResponse) {
        setPaymentState("error");
        setCheckoutError("Bakong returned an unexpected payment payload.");
        return;
      }

      setPaymentSession(normalizedResponse);
      setPaymentState("ready");
      startCountdown(
        normalizedResponse.expiresAt,
        normalizedResponse.paymentId,
      );
      startPolling(normalizedResponse.paymentId);
    } catch (error) {
      if (isApiError(error)) {
        if (error.status === 401) {
          await redirectToLogin();
          return;
        }

        if (error.status === 404) {
          router.refresh();
          setStep("cart");
          setPaymentState("error");
          setCheckoutError(
            "One or more products were not found. Please review your cart.",
          );
          return;
        }

        if (error.status === 409) {
          router.refresh();
          setStep("cart");
          setPaymentState("error");
          setCheckoutError(
            "Some items are out of stock. Please update your cart and try again.",
          );
          return;
        }

        setCheckoutError(error.message);
      } else {
        setCheckoutError(
          "Unable to start Bakong payment right now. Please try again.",
        );
      }

      setPaymentState("error");
    } finally {
      initRequestInFlightRef.current = false;
    }
  }

  async function cancelPendingPayment(options?: { keepalive?: boolean }) {
    const currentSession = paymentSessionRef.current;
    const currentState = paymentStateRef.current;

    stopPolling();
    stopCountdown();

    if (!currentSession || !isPendingPaymentState(currentState)) {
      clearPaymentAttemptState();
      return;
    }

    if (options?.keepalive && typeof window !== "undefined") {
      const accessToken = getSessionSnapshot().accessToken;

      if (accessToken) {
        void fetch(
          `/api/v1/checkout/bakong/${currentSession.paymentId}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            keepalive: true,
          },
        );
      }

      clearPaymentAttemptState();
      return;
    }

    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      clearPaymentAttemptState();
      return;
    }

    setCancelInFlight(true);

    try {
      await cancelBakongPayment(currentSession.paymentId, accessToken);
    } catch {
      // Best effort cleanup. Backend cancellation still runs on unmount/navigation.
    } finally {
      setCancelInFlight(false);
      clearPaymentAttemptState();
    }
  }

  async function handleStepBack(target: CheckoutStep | "users") {
    if (step === "payment") {
      await cancelPendingPayment();
    }

    if (target === "users") {
      router.push("/users");
      return;
    }

    setShowErrors(false);
    setCheckoutError(null);
    setStep(target);
  }

  async function handleStepClick(target: CheckoutStep) {
    if (target === step) {
      return;
    }

    const targetIndex = stepOrder.indexOf(target);
    if (targetIndex === -1 || targetIndex > maxAvailableStepIndex) {
      return;
    }

    await handleStepBack(target);

    if (target === "payment" && paymentSessionRef.current === null) {
      void startBakongPayment();
    }
  }

  function handleQuantityChange(productId: string, newQuantity: number) {
    const liveStockLimit = stockByCartProductId[productId];
    const maxAllowed =
      typeof liveStockLimit === "number" && Number.isFinite(liveStockLimit)
        ? Math.max(0, liveStockLimit)
        : Number.POSITIVE_INFINITY;

    if (maxAllowed <= 0) return;
    if (newQuantity >= 1) {
      updateQuantity(productId, Math.min(newQuantity, maxAllowed));
    }
  }

  async function handleCheckout() {
    if (step === "cart" && items.length > 0) {
      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      let hasStockIssue = false;
      try {
        const allocation = await syncCartStock(accessToken);
        if (allocation.outOfStockNames.length > 0) {
          hasStockIssue = true;
          setCheckoutError(
            `Out of stock: ${allocation.outOfStockNames.join(", ")}. Please review your cart.`,
          );
        }
      } catch {
        // keep current cart if sync fails
      }

      setShowErrors(false);
      if (!hasStockIssue) {
        setCheckoutError(null);
      }
      setStep("shipping");
      return;
    }

    if (step === "shipping") {
      const accessToken = await ensureAccessToken();
      if (!accessToken) return;

      try {
        const allocation = await syncCartStock(accessToken);
        if (allocation.outOfStockNames.length > 0) {
          setCheckoutError(
            `Out of stock: ${allocation.outOfStockNames.join(", ")}. Please update your cart before payment.`,
          );
          return;
        }
      } catch {
        setCheckoutError("Unable to validate stock right now. Please try again.");
        return;
      }

      const valid =
        isShippingComplete(shipping) && isValidBillName(shipping.fullName);
      if (!valid) {
        setShowErrors(true);
        if (!isValidBillName(shipping.fullName)) {
          setCheckoutError(
            `Full name must be ${BAKONG_BILL_NAME_MAX_LENGTH} characters or fewer for Bakong payment.`,
          );
        }
        return;
      }

      setShowErrors(false);
      setCheckoutError(null);
      setStep("payment");
      void startBakongPayment();
    }
  }

  function handleRetryPayment() {
    clearPaymentAttemptState();
    void startBakongPayment();
  }

  async function handlePaymentAction() {
    if (!paymentSession) {
      return;
    }

    if (paymentSession.deeplink && isMobile) {
      window.location.href = paymentSession.deeplink;
      return;
    }

    await checkPaymentStatus(paymentSession.paymentId);
  }

  useEffect(() => {
    const accessToken = getSessionSnapshot().accessToken;
    if (!accessToken || items.length === 0) {
      setStockByCartProductId({});
      setOutOfStockNames([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const productsResponse = await getProducts(accessToken);
        if (cancelled) return;

        const allProducts = productsResponse.data || [];
        const allocation = allocateCheckoutItems(items, allProducts);
        if (cancelled) return;

        setStockByCartProductId(allocation.stockByCartProductId);
        setOutOfStockNames(allocation.outOfStockNames);
      } catch {
        if (!cancelled) {
          setStockByCartProductId({});
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    if (step === "payment" || items.length === 0) {
      return;
    }

    const accessToken = getSessionSnapshot().accessToken;
    if (!accessToken) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const productsResponse = await getProducts(accessToken);
        if (cancelled) return;

        const allProducts = productsResponse.data || [];
        const allocation = allocateCheckoutItems(items, allProducts);
        if (cancelled) return;

        setStockByCartProductId(allocation.stockByCartProductId);
        setOutOfStockNames(allocation.outOfStockNames);
      } catch {
        // keep last known stock state
      }
    };

    void run();
    const intervalId = window.setInterval(() => {
      void run();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [items, step]);

  useEffect(() => {
    return () => {
      const currentSession = paymentSessionRef.current;
      const currentState = paymentStateRef.current;
      if (!currentSession || !isPendingPaymentState(currentState)) {
        return;
      }

      const accessToken = getSessionSnapshot().accessToken;
      if (!accessToken) {
        return;
      }

      void fetch(`/api/v1/checkout/bakong/${currentSession.paymentId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        keepalive: true,
      });
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentSession = paymentSessionRef.current;
      const currentState = paymentStateRef.current;
      if (!currentSession || !isPendingPaymentState(currentState)) {
        return;
      }

      const accessToken = getSessionSnapshot().accessToken;
      if (!accessToken) {
        return;
      }

      void fetch(`/api/v1/checkout/bakong/${currentSession.paymentId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (step === "cart") {
                  void handleStepBack("users");
                  return;
                }

                if (step === "shipping") {
                  void handleStepBack("cart");
                  return;
                }

                void handleStepBack("shipping");
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="max-w-[70vw] truncate text-base font-bold sm:max-w-none sm:text-xl">
              {step === "cart" && "Shopping Cart"}
              {step === "shipping" && "Shipping Address"}
              {step === "payment" && "Bakong Payment"}
            </h1>
          </div>

          <div className="hidden md:block">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {step === "cart" ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm">Cart</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={() => void handleStepClick("cart")}
                        className="flex items-center gap-1 text-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Cart</span>
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {step === "shipping" ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">Shipping</span>
                    </BreadcrumbPage>
                  ) : maxAvailableStepIndex >= stepOrder.indexOf("shipping") ? (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={() => void handleStepClick("shipping")}
                        className="flex items-center gap-1 text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Shipping</span>
                      </button>
                    </BreadcrumbLink>
                  ) : (
                    <span className="flex cursor-not-allowed items-center gap-1 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>Shipping</span>
                    </span>
                  )}
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {step === "payment" ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Payment</span>
                    </BreadcrumbPage>
                  ) : maxAvailableStepIndex >= stepOrder.indexOf("payment") ? (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={() => void handleStepClick("payment")}
                        className="flex items-center gap-1 text-sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Payment</span>
                      </button>
                    </BreadcrumbLink>
                  ) : (
                    <span className="flex cursor-not-allowed items-center gap-1 text-sm text-gray-400">
                      <CreditCard className="h-4 w-4" />
                      <span>Payment</span>
                    </span>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {items.length === 0 && step === "cart" ? (
          <Card className="py-16 text-center">
            <CardContent>
              <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                Your cart is empty
              </h2>
              <p className="mb-6 text-gray-500">
                Add some products to your cart to continue shopping.
              </p>
              <Button onClick={() => router.push("/users")}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-4">
              {checkoutError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {hasOutOfStockItems && (step === "cart" || step === "shipping") && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Out of stock: {outOfStockNames.join(", ")}. Please reduce quantity or remove those items.
                  </span>
                </div>
              )}

              {step === "cart" && (
                <>
                  {items.map((item) => {
                    const stockLimit =
                      stockByCartProductId[item.product.id] ??
                      getCartItemStockLimit(item);
                    const isOutOfStock = stockLimit <= 0;
                    const reachedStockLimit = item.quantity >= stockLimit;

                    return (
                    <Card key={item.product.id} className={isOutOfStock ? "border-amber-200 bg-amber-50/30" : ""}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <div className={`flex min-w-0 flex-1 gap-3 sm:gap-4 ${isOutOfStock ? "opacity-40" : ""}`}>
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                              {item.product.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-medium sm:text-base">
                                {item.product.name}
                              </h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {[item.product.storage, item.product.color]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </p>
                              <p className="mt-2 text-sm font-bold sm:text-base">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-between sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className={`flex shrink-0 items-center gap-1 rounded-lg border sm:gap-2 ${isOutOfStock ? "opacity-40" : ""}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1 || isOutOfStock}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-7 text-center text-sm font-medium sm:w-8">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={reachedStockLimit || isOutOfStock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </>
              )}

              {step === "shipping" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("shippingAddress")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder={
                            showErrors && !shipping.fullName.trim()
                              ? "Please fill in this field"
                              : "Chan Thida"
                          }
                          value={shipping.fullName}
                          onChange={(event) =>
                            setShipping((current) => ({
                              ...current,
                              fullName: event.target.value.slice(
                                0,
                                BAKONG_BILL_NAME_MAX_LENGTH,
                              ),
                            }))
                          }
                          className={
                            (showErrors && !shipping.fullName.trim()) ||
                            !isValidBillName(shipping.fullName)
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                          maxLength={BAKONG_BILL_NAME_MAX_LENGTH}
                        />
                        {!isValidBillName(shipping.fullName) &&
                          shipping.fullName.trim() && (
                            <p className="mt-1 text-xs text-red-600">
                              Use {BAKONG_BILL_NAME_MAX_LENGTH} characters or
                              fewer.
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder={
                            showErrors && !shipping.phone.trim()
                              ? "Please fill in this field"
                              : "012 345 678"
                          }
                          value={shipping.phone}
                          onChange={(event) =>
                            setShipping((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          className={
                            showErrors && !shipping.phone.trim()
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={
                          showErrors && !shipping.addressLine1.trim()
                            ? "Please fill in this field"
                            : "Street address"
                        }
                        value={shipping.addressLine1}
                        onChange={(event) =>
                          setShipping((current) => ({
                            ...current,
                            addressLine1: event.target.value,
                          }))
                        }
                        className={
                          showErrors && !shipping.addressLine1.trim()
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Notes
                      </label>
                      <textarea
                        value={shipping.notes ?? ""}
                        onChange={(event) =>
                          setShipping((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Leave at reception"
                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Bakong Checkout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {paymentState === "initializing" && (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 py-16 text-center">
                        <LoaderCircle className="h-8 w-8 animate-spin text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Generating your Bakong QR
                          </p>
                          <p className="text-sm text-gray-500">
                            Creating a pending order and payment with the
                            backend.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentSession && paymentState !== "initializing" && (
                      <>
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
                          <div
                            className={`${
                              paymentState === "expired"
                                ? "pointer-events-none opacity-40 grayscale"
                                : ""
                            }`}
                          >
                            <KhqrCode
                              value={paymentSession.qrString}
                              size={320}
                              className="mx-auto"
                              receiverName={normalizedBillName || shipping.fullName.trim()}
                              amountLabel={formatPrice(
                                paymentSession.amount,
                                paymentSession.currency,
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-xl bg-gray-50 p-4">
                              <p className="text-sm text-gray-500">
                                Amount due
                              </p>
                              <p className="mt-1 text-3xl font-semibold text-gray-900">
                                {formatPrice(
                                  paymentSession.amount,
                                  paymentSession.currency,
                                )}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="gap-1 rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm"
                                >
                                  <Clock3 className="h-3.5 w-3.5" />
                                  Expires in {formatCountdown(remainingMs)}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                                >
                                  Ready
                                </Badge>
                              </div>
                            </div>

                            <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                              <p className="font-medium text-gray-900">
                                How it works
                              </p>
                              <ul className="mt-2 space-y-2">
                                <li>1. Scan this KHQR in the Bakong app.</li>
                                <li>2. Complete payment in the Bakong app.</li>
                                <li>
                                  3. Stay on this page while we confirm the
                                  payment with the backend.
                                </li>
                              </ul>
                            </div>

                            {paymentState === "ready" && (
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                  className="flex-1 bg-black text-white hover:bg-gray-800"
                                  size="lg"
                                  onClick={() => void handlePaymentAction()}
                                >
                                  {paymentSession.deeplink && isMobile && (
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                  )}
                                  {actionLabel}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="flex-1"
                                  onClick={() =>
                                    void handleStepBack("shipping")
                                  }
                                  disabled={cancelInFlight}
                                >
                                  {cancelInFlight
                                    ? "Cancelling..."
                                    : "Cancel payment"}
                                </Button>
                              </div>
                            )}

                            {paymentState === "expired" && (
                              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">
                                  <CircleAlert className="mt-0.5 h-5 w-5 text-amber-700" />
                                  <div>
                                    <p className="font-medium text-amber-900">
                                      QR expired
                                    </p>
                                    <p className="text-sm text-amber-800">
                                      Start a fresh Bakong payment to get a new
                                      QR.
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  className="w-full sm:w-auto"
                                  onClick={handleRetryPayment}
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Generate new QR
                                </Button>
                              </div>
                            )}

                            {paymentState === "failed" && (
                              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-start gap-3">
                                  <CircleAlert className="mt-0.5 h-5 w-5 text-red-700" />
                                  <div>
                                    <p className="font-medium text-red-900">
                                      Payment failed
                                    </p>
                                    <p className="text-sm text-red-800">
                                      Start a fresh Bakong payment attempt to
                                      continue.
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  className="w-full sm:w-auto"
                                  onClick={handleRetryPayment}
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Try again
                                </Button>
                              </div>
                            )}

                            {paymentState === "error" && (
                              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-800">
                                  We could not create a Bakong payment session.
                                </p>
                                <Button
                                  className="w-full sm:w-auto"
                                  onClick={handleRetryPayment}
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Retry payment
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {items.map((item) => {
                      const isOutOfStock = isItemOutOfStock(item);
                      return (
                        <div
                          key={item.product.id}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <span className={`min-w-0 flex-1 truncate ${isOutOfStock ? "text-amber-700" : "text-gray-600"}`}>
                            {item.product.name} × {item.quantity}
                            {isOutOfStock ? " (Out of stock)" : ""}
                          </span>
                          <span className="shrink-0">
                            {isOutOfStock
                              ? formatPrice(0)
                              : formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("subtotal")}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated shipping</span>
                      <span>
                        {estimatedShipping === 0
                          ? "Free"
                          : formatPrice(estimatedShipping)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>
                        {paymentSession ? "Backend total" : "Estimated total"}
                      </span>
                      <span>
                        {paymentSession
                          ? formatPrice(
                              paymentSession.amount,
                              paymentSession.currency,
                            )
                          : formatPrice(estimatedTotal)}
                      </span>
                    </div>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      Free shipping
                    </Badge>
                  </div>

                  {step === "payment" && (
                    <div className="border-t pt-4 text-sm text-gray-600">
                      <p className="mb-2 font-medium text-gray-900">
                        Shipping to
                      </p>
                      <p>{shipping.fullName}</p>
                      <p>{shipping.phone}</p>
                      <p>{shipping.addressLine1}</p>
                      {shipping.notes && <p>Notes: {shipping.notes}</p>}
                    </div>
                  )}

                  {step !== "payment" && (
                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={
                        (step === "cart" && items.length === 0) ||
                        (step === "shipping" && hasOutOfStockItems)
                      }
                    >
                      {step === "cart" && "Proceed to Checkout"}
                      {step === "shipping" && "Continue to Payment"}
                    </Button>
                  )}

                  {step === "cart" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/users")}
                    >
                      {t("continueShopping")}
                    </Button>
                  )}

                  {step === "payment" && paymentState === "paid" && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Redirecting to payment success...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
