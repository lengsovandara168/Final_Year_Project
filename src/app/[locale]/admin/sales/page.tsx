"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { KhqrCode } from "@/components/khqr-code";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";

import { getSessionSnapshot } from "@/lib/auth-session";
import {
  cancelBakongPayment,
  getBakongPaymentStatus,
  getProducts,
  initBakongCheckout,
  Product,
  type CheckoutCurrency,
  type InitBakongCheckoutResponse,
  type OrderSummaryV2,
} from "@/lib/api";
import {
  generateReceiptPrintHtml,
  printReceiptHtml,
} from "@/components/receipt/receipt-print";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { CartItemList, CartItem } from "./components/CartItemList";
import { ManualProductPicker } from "./components/ManualProductPicker";
import {
  PageAlertMessage,
  type PageAlertState,
} from "./components/PageAlertMessage";

type ActiveTab = "sell" | "history" | "levels";
const BAKONG_BILL_NAME_MAX_LENGTH = 25;
type PaymentUiState =
  | "idle"
  | "initializing"
  | "ready"
  | "checking"
  | "paid"
  | "failed"
  | "expired"
  | "error";

type PaymentSession = {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: CheckoutCurrency;
  qrString: string;
  deeplink: string | null;
  expiresAt: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

function buildCheckoutItems(items: CartItem[]) {
  return items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      productId: item.id,
    })),
  );
}

function normalizeBillName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, BAKONG_BILL_NAME_MAX_LENGTH);
}

function formatCountdown(remainingMs: number | null) {
  if (remainingMs === null) return "--:--";
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeBakongInitResponse(
  value: InitBakongCheckoutResponse,
): PaymentSession | null {
  if (typeof value !== "object" || value === null) return null;

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
    value.ok !== true ||
    typeof value.orderId !== "string" ||
    typeof value.paymentId !== "string" ||
    typeof value.amount !== "number" ||
    (value.currency !== "USD" && value.currency !== "KHR") ||
    typeof value.expiresAt !== "string" ||
    typeof resolvedQrString !== "string"
  ) {
    return null;
  }

  return {
    orderId: value.orderId,
    paymentId: value.paymentId,
    amount: value.amount,
    currency: value.currency,
    qrString: resolvedQrString,
    deeplink: resolvedDeeplink,
    expiresAt: value.expiresAt,
  };
}

function normalizePaymentStatus(value: unknown):
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "paid" || normalized === "completed" || normalized === "success") {
    return "paid";
  }
  if (normalized === "failed") return "failed";
  if (normalized === "expired" || normalized === "timeout") return "expired";

  return null;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { accessToken } = getSessionSnapshot();
  if (!accessToken) throw new Error("Not authenticated");

  const res = await getProducts(accessToken);
  return Array.isArray(res.data) ? res.data : [];
};

export default function SalesPage() {
  const t = useTranslations("AdminSales");
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ActiveTab>("sell");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentUiState>("idle");
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [cancelInFlight, setCancelInFlight] = useState(false);

  const [manualPopoverOpen, setManualPopoverOpen] = useState(false);
  const [manualSearch, setManualSearch] = useState("");

  const [pageAlert, setPageAlert] = useState<PageAlertState | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const statusRequestInFlightRef = useRef(false);

  const {
    data: products = [],
    isLoading: loadingProducts,
    isError,
    error,
  } = useQuery({
    queryKey: ["pos-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isError || !error) return;

    setPageAlert({
      title: t("failedLoadTitle"),
      description: getErrorMessage(error, t("pleaseTryAgain")),
      variant: "destructive",
    });
    toast.error(t("failedLoadTitle"), {
      description: getErrorMessage(error, t("pleaseTryAgain")),
    });
  }, [isError, error, t]);

  const addProductToCart = useCallback(
    (product: Product) => {
      if (!product.inStock) {
        setPageAlert({
          title: t("checkoutFailedTitle"),
          description: "This product is out of stock.",
          variant: "destructive",
        });
        toast.error(t("checkoutFailedTitle"), {
          description: "This product is out of stock.",
        });
        return;
      }

      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev;
        }

        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            barcode: product.imei,
          },
        ];
      });
      toast.success(t("addedToCart"), {
        description: product.name,
      });
    },
    [t],
  );

  const filteredManualProducts = useMemo(() => {
    const query = manualSearch.trim().toLowerCase();
    if (!query) return products.filter((p) => p.inStock).slice(0, 10);

    return products
      .filter(
        (p) =>
          p.inStock &&
          (p.name.toLowerCase().includes(query) ||
            (p.imei && p.imei.toLowerCase().includes(query))),
      )
      .slice(0, 10);
  }, [manualSearch, products]);

  const handleManualAdd = useCallback(
    (product: Product) => {
      addProductToCart(product);
      setManualPopoverOpen(false);
      setManualSearch("");
    },
    [addProductToCart],
  );

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const normalized = barcode.trim().toLowerCase();
      const found = products.find((p) => p.imei.toLowerCase() === normalized);

      if (!found) {
        setPageAlert({
          title: t("productNotFoundTitle"),
          description: t("productNotFoundDesc", { barcode }),
          variant: "destructive",
        });
        toast.error(t("productNotFoundTitle"), {
          description: t("productNotFoundDesc", { barcode }),
        });
        return;
      }

      if (!found.inStock) {
        setPageAlert({
          title: t("checkoutFailedTitle"),
          description: "This product is out of stock.",
          variant: "destructive",
        });
        toast.error(t("checkoutFailedTitle"), {
          description: "This product is out of stock.",
        });
        return;
      }

      addProductToCart(found);
    },
    [products, addProductToCart, t],
  );

  const handleRemoveFromCart = useCallback(
    (id: string) => {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(t("itemRemoved"));
    },
    [t],
  );

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: 1 } : i)));
  }, []);

  const cartSubtotal = useMemo(
    () =>
      Number(
        cartItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2),
      ),
    [cartItems],
  );

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearPaymentAttemptState = useCallback(() => {
    stopPolling();
    stopCountdown();
    statusRequestInFlightRef.current = false;
    setPaymentSession(null);
    setRemainingMs(null);
    setStatusNotice(null);
    setPaymentState("idle");
    setCancelInFlight(false);
  }, [stopCountdown, stopPolling]);

  const finalizePaidFlow = useCallback(
    (orderId: string) => {
      const orderSummary: OrderSummaryV2 = {
        orderNumber: orderId,
        createdAt: new Date().toISOString(),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imei: item.barcode,
        })),
        shippingAddress: {
          fullName: t("walkInCustomer"),
          phone: "N/A",
          address: t("inStore"),
          city: t("city"),
          zipCode: "00000",
        },
        subtotal: cartSubtotal,
        shipping: 0,
        tradeIns: [],
        tradeInTotal: 0,
        grandTotal: cartSubtotal,
        payments: [{ id: "payment-cash", method: "cash", amount: cartSubtotal }],
        amountPaid: cartSubtotal,
        changeDue: 0,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("lastOrderSummaryV2", JSON.stringify(orderSummary));
      }

      const receiptHtml = generateReceiptPrintHtml(orderSummary, {
        brandName: "LDHS",
        title: t("receiptTitle"),
      });
      printReceiptHtml(receiptHtml);

      setCartItems([]);
      clearPaymentAttemptState();
      toast.success(t("paymentCompleteTitle"), {
        description: t("paymentCompleteDesc", { orderNumber: orderId }),
      });
      setPageAlert({
        title: t("paymentCompleteTitle"),
        description: t("paymentCompleteDesc", { orderNumber: orderId }),
        variant: "default",
      });
    },
    [cartItems, cartSubtotal, clearPaymentAttemptState, t],
  );

  const checkPaymentStatus = useCallback(
    async (paymentId: string) => {
      if (statusRequestInFlightRef.current) return;

      const { accessToken } = getSessionSnapshot();
      if (!accessToken) {
        setPaymentState("error");
        setStatusNotice(null);
        setPageAlert({
          title: t("checkoutFailedTitle"),
          description: "Not authenticated.",
          variant: "destructive",
        });
        return;
      }

      statusRequestInFlightRef.current = true;
      setPaymentState((current) =>
        current === "initializing" ? current : "checking",
      );

      try {
        const response = await getBakongPaymentStatus(paymentId, accessToken);
        const normalizedStatus = normalizePaymentStatus(response.status);

        if (normalizedStatus === null && response.receiptNumber) {
          setPaymentState("paid");
          setStatusNotice("Payment confirmed. Printing receipt...");
          finalizePaidFlow(response.orderId ?? paymentSession?.orderId ?? "-");
          return;
        }

        if (normalizedStatus === "pending") {
          setPaymentState("ready");
          setStatusNotice(null);
          return;
        }

        stopPolling();
        stopCountdown();

        if (normalizedStatus === "paid") {
          setPaymentState("paid");
          setStatusNotice("Payment confirmed. Printing receipt...");
          finalizePaidFlow(response.orderId ?? paymentSession?.orderId ?? "-");
          return;
        }

        if (normalizedStatus === "failed") {
          setPaymentState("failed");
          setStatusNotice(null);
          setPageAlert({
            title: t("checkoutFailedTitle"),
            description: "Payment failed. Please start a fresh Bakong payment.",
            variant: "destructive",
          });
          return;
        }

        if (normalizedStatus === null) {
          setPaymentState("ready");
          setStatusNotice("Waiting for payment confirmation...");
          return;
        }

        setPaymentState("expired");
        setStatusNotice(null);
        setPageAlert({
          title: t("checkoutFailedTitle"),
          description: "QR expired. Generate a new QR to continue.",
          variant: "destructive",
        });
      } catch (error) {
        setPaymentState("ready");
        setStatusNotice("Connection issue while checking payment. Retrying...");
        setPageAlert({
          title: t("checkoutFailedTitle"),
          description: getErrorMessage(error, t("checkoutFailedDesc")),
          variant: "destructive",
        });
      } finally {
        statusRequestInFlightRef.current = false;
      }
    },
    [finalizePaidFlow, paymentSession?.orderId, stopCountdown, stopPolling, t],
  );

  const startCountdown = useCallback(
    (expiresAt: string, paymentId: string) => {
      stopCountdown();

      const updateCountdown = () => {
        const expiresAtMs = new Date(expiresAt).getTime();
        const nextRemainingMs = Math.max(0, expiresAtMs - Date.now());
        setRemainingMs(nextRemainingMs);

        if (nextRemainingMs > 0) return;

        stopCountdown();
        setStatusNotice("QR reached expiry time. Checking payment...");
        void checkPaymentStatus(paymentId);
      };

      updateCountdown();
      countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);
    },
    [checkPaymentStatus, stopCountdown],
  );

  const startPolling = useCallback(
    (paymentId: string) => {
      stopPolling();
      pollIntervalRef.current = window.setInterval(() => {
        void checkPaymentStatus(paymentId);
      }, 3000);
    },
    [checkPaymentStatus, stopPolling],
  );

  const handlePayAndPrintReceipt = useCallback(async () => {
    if (cartItems.length === 0 || isProcessingCheckout || paymentSession) {
      return;
    }

    try {
      setIsProcessingCheckout(true);

      const { accessToken } = getSessionSnapshot();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const walkInBillName = normalizeBillName(t("walkInCustomer")) || "Walk-in";

      const response = await initBakongCheckout(
        {
          items: buildCheckoutItems(cartItems),
          shipping: {
            fullName: walkInBillName,
            phone: "012345678",
            addressLine1: t("inStore"),
            city: t("city"),
            postalCode: "00000",
          },
          currency: "USD",
          note: "POS walk-in sale",
        },
        accessToken,
      );

      const normalized = normalizeBakongInitResponse(response);
      if (!normalized) {
        throw new Error("Bakong returned an unexpected payment payload.");
      }

      setPaymentSession(normalized);
      setPaymentState("ready");
      setStatusNotice(null);
      startCountdown(normalized.expiresAt, normalized.paymentId);
      startPolling(normalized.paymentId);
      toast.success("Bakong payment session created");
    } catch (error) {
      setPaymentState("error");
      setPageAlert({
        title: t("checkoutFailedTitle"),
        description: getErrorMessage(error, t("checkoutFailedDesc")),
        variant: "destructive",
      });
      toast.error(t("checkoutFailedTitle"), {
        description: getErrorMessage(error, t("checkoutFailedDesc")),
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [
    cartItems,
    isProcessingCheckout,
    paymentSession,
    startCountdown,
    startPolling,
    t,
  ]);

  const handlePaymentAction = useCallback(async () => {
    if (!paymentSession) return;

    if (paymentSession.deeplink && isMobile) {
      window.location.href = paymentSession.deeplink;
      return;
    }

    await checkPaymentStatus(paymentSession.paymentId);
  }, [checkPaymentStatus, isMobile, paymentSession]);

  const handleRetryPayment = useCallback(async () => {
    clearPaymentAttemptState();
    await handlePayAndPrintReceipt();
  }, [clearPaymentAttemptState, handlePayAndPrintReceipt]);

  const handleCancelPayment = useCallback(async () => {
    if (!paymentSession || cancelInFlight) return;

    const { accessToken } = getSessionSnapshot();
    if (!accessToken) {
      clearPaymentAttemptState();
      return;
    }

    setCancelInFlight(true);
    try {
      await cancelBakongPayment(paymentSession.paymentId, accessToken);
    } finally {
      clearPaymentAttemptState();
    }
  }, [cancelInFlight, clearPaymentAttemptState, paymentSession]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopCountdown();
    };
  }, [stopCountdown, stopPolling]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
      </div>

      <PageAlertMessage alert={pageAlert} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="sell">{t("tabs.sell")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
          <TabsTrigger value="levels">{t("tabs.levels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <ProductSearchBar
                value={searchValue}
                onChange={setSearchValue}
                onBarcodeScan={handleBarcodeScan}
                placeholder={t("searchPlaceholder")}
                ariaLabel={t("searchAriaLabel")}
              />
            </div>

            <ManualProductPicker
              open={manualPopoverOpen}
              onOpenChange={setManualPopoverOpen}
              search={manualSearch}
              onSearchChange={setManualSearch}
              loading={loadingProducts}
              products={filteredManualProducts}
              onAdd={handleManualAdd}
              triggerLabel={t("addManually")}
              searchPlaceholder={t("manualSearchPlaceholder")}
              loadingText={t("loadingProducts")}
              emptyText={t("noProductsFound")}
              addButtonText={t("add")}
            />
          </div>

          <CartItemList
            items={cartItems}
            onQuantityChange={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
            emptyText={t("cartEmpty")}
            removeText={t("remove")}
            decreaseLabel={t("decreaseQuantity")}
            quantityLabel={t("quantity")}
            increaseLabel={t("increaseQuantity")}
            removeLabel={t("removeItem")}
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold">
              {t("total")}: ${cartSubtotal.toFixed(2)}
            </div>
            <Button
              onClick={paymentSession ? () => void handlePaymentAction() : () => void handlePayAndPrintReceipt()}
              disabled={cartItems.length === 0 || isProcessingCheckout || cancelInFlight}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessingCheckout
                ? t("processing")
                : paymentSession?.deeplink && isMobile
                  ? "Open Bakong"
                  : paymentSession
                    ? "I have paid"
                    : t("payAndPrintReceipt")}
            </Button>
          </div>

          {statusNotice && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <LoaderCircle className="mt-0.5 h-4 w-4 animate-spin" />
              <span>{statusNotice}</span>
            </div>
          )}

          {paymentSession && (
            <Card>
              <CardHeader>
                <CardTitle>Bakong Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentState !== "paid" && (
                  <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                    <CircleAlert className="h-4 w-4" />
                    <AlertTitle>UNPAID</AlertTitle>
                    <AlertDescription>
                      Payment is not confirmed yet. Do not hand over products until
                      status is PAID.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                  <div className="rounded-lg border p-2">
                    <KhqrCode value={paymentSession.qrString} size={220} className="h-auto w-full max-w-55" />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="text-sm text-muted-foreground">Amount due</div>
                      <div className="text-xl font-semibold">
                        ${paymentSession.amount.toFixed(2)} {paymentSession.currency}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
                        <Clock3 className="h-3.5 w-3.5" /> Expires in {formatCountdown(remainingMs)}
                      </div>
                    </div>

                    {(paymentState === "ready" || paymentState === "checking") && (
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void handlePaymentAction()}>
                          {paymentSession.deeplink && isMobile && <ExternalLink className="mr-2 h-4 w-4" />}
                          {paymentSession.deeplink && isMobile ? "Open Bakong" : "I have paid"}
                        </Button>
                        <Button variant="outline" onClick={() => void handleCancelPayment()} disabled={cancelInFlight}>
                          {cancelInFlight ? "Cancelling..." : "Cancel payment"}
                        </Button>
                      </div>
                    )}

                    {paymentState === "expired" && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <div className="mb-2 flex items-center gap-2 font-medium">
                          <CircleAlert className="h-4 w-4" /> QR expired
                        </div>
                        <Button size="sm" onClick={() => void handleRetryPayment()}>
                          <RefreshCcw className="mr-2 h-4 w-4" /> Generate new QR
                        </Button>
                      </div>
                    )}

                    {paymentState === "failed" && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <div className="mb-2 flex items-center gap-2 font-medium">
                          <CircleAlert className="h-4 w-4" /> Payment failed
                        </div>
                        <Button size="sm" onClick={() => void handleRetryPayment()}>
                          <RefreshCcw className="mr-2 h-4 w-4" /> Try again
                        </Button>
                      </div>
                    )}

                    {paymentState === "paid" && (
                      <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Payment confirmed
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- HISTORY TAB --- */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("stockHistoryTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                {t("historyComingSoon")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>{t("stockLevelsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                {t("stockLevelsComingSoon")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster position="top-right" />
    </div>
  );
}
