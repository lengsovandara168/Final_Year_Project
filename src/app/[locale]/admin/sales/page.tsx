"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@/lib/api/products";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// API & Helpers
import { getSessionSnapshot } from "@/lib/auth-session";
import { getAdminProducts } from "@/lib/api";
import {
  cancelPosPayment,
  createPosCheckout,
  getPosPaymentStatus,
} from "@/lib/api/pos";
import {
  generateReceiptPrintHtml,
  printReceiptHtml,
} from "@/components/receipt/receipt-print";

// Custom Components
import { ProductSearchBar } from "./components/ProductSearchBar";

import {
  PageAlertMessage,
  type PageAlertState,
} from "./components/PageAlertMessage";
import { CartItem } from "./components/CartItemList";
import { QuickSelectGrid } from "./components/QuickSelectGrid";
import { CartPanel } from "./components/CartPanel";
import { PaymentModal, type PosPaymentSession } from "./components/PaymentModal";
import { SalesHistoryPanel } from "./components/SaleHistoryPanel";
import { CashPaymentModal } from "./components/cashPaymentModal";

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function normalizePosPaymentSession(value: unknown): PosPaymentSession | null {
  const payload = getRecord(value);
  if (!payload) return null;

  const nested = getRecord(payload.data);
  const paymentId =
    typeof nested?.paymentId === "string"
      ? nested.paymentId
      : typeof payload.paymentId === "string"
        ? payload.paymentId
        : null;
  const orderNumber =
    typeof nested?.orderNumber === "string"
      ? nested.orderNumber
      : typeof payload.orderNumber === "string"
        ? payload.orderNumber
        : null;
  const amount =
    typeof nested?.total === "number"
      ? nested.total
      : typeof nested?.subtotal === "number"
        ? nested.subtotal
        : typeof payload.total === "number"
          ? payload.total
          : typeof payload.amount === "number"
            ? payload.amount
            : null;
  const qrString =
    typeof nested?.qrString === "string"
      ? nested.qrString
      : typeof payload.qrString === "string"
        ? payload.qrString
        : typeof payload.khqrString === "string"
          ? payload.khqrString
          : typeof payload.khqr === "string"
            ? payload.khqr
            : null;
  const expiresAt =
    typeof nested?.expiresAt === "string"
      ? nested.expiresAt
      : typeof payload.expiresAt === "string"
        ? payload.expiresAt
        : null;
  const currency =
    nested?.currency === "USD" || nested?.currency === "KHR"
      ? nested.currency
      : payload.currency === "USD" || payload.currency === "KHR"
        ? payload.currency
        : "USD";
  const status =
    typeof nested?.status === "string"
      ? nested.status
      : typeof payload.status === "string"
        ? payload.status
        : "pending";

  if (
    !paymentId ||
    !orderNumber ||
    typeof amount !== "number" ||
    !qrString ||
    !expiresAt
  ) {
    return null;
  }

  return {
    paymentId,
    orderNumber,
    amount,
    currency,
    qrString,
    expiresAt,
    status,
  };
}

function normalizePosPaymentStatus(value: unknown): Record<string, unknown> | null {
  const payload = getRecord(value);
  if (!payload) return null;
  return getRecord(payload.data) ?? payload;
}

export default function SalesPage() {
  const t = useTranslations("AdminSales");

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("sell");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentSession, setPaymentSession] =
    useState<PosPaymentSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [isCancellingPayment, setIsCancellingPayment] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [pageAlert, setPageAlert] = useState<PageAlertState | null>(null);

  // --- REFS ---
  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // --- DATA FETCHING (Using Admin API for full IMEI Inventory) ---
  const {
    data: products = [],
    isLoading: loadingProducts,
    refetch,
  } = useQuery({
    queryKey: ["pos-inventory-full"],
    queryFn: async () => {
      const { accessToken } = getSessionSnapshot();
      if (!accessToken) throw new Error("Not authenticated");
      const res = await getAdminProducts(accessToken);
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 0,
  });

  // --- COMPUTED VALUES ---
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // --- UTILITIES ---
  const stopTimers = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
  };

  const clearPayment = () => {
    stopTimers();
    setPaymentSession(null);
    setRemainingMs(null);
    setIsCancellingPayment(false);
  };

  const printReceipt = (orderId: string, cashReceived?: number) => {
    const summary = {
      orderNumber: orderId,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({ ...item, imei: item.barcode })),
      subtotal: cartSubtotal,
      grandTotal: cartSubtotal,
      amountPaid: cashReceived || cartSubtotal,
      changeDue: cashReceived ? cashReceived - cartSubtotal : 0,
      payments: [
        { method: cashReceived ? "cash" : "bakong", amount: cartSubtotal },
      ],
    };
    printReceiptHtml(
      generateReceiptPrintHtml(
        summary as Parameters<typeof generateReceiptPrintHtml>[0],
        {
          brandName: "LDHS",
          title: "Receipt",
        },
      ),
    );
  };

  // --- HANDLERS ---
  const addProductToCart = (product: Product) => {
    if (!product.inStock) {
      toast.error("Out of stock");
      return;
    }

    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      toast.info("This inventory unit is already in the current order.", {
        description: product.name,
      });
      return;
    }

    setCartItems((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        barcode: product.imei ?? undefined,
      },
    ]);
    toast.success(t("addedToCart"), { description: product.name });
  };
  const performCheckout = async (
    method: "bakong" | "cash",
    cashReceived?: number,
  ) => {
    if (cartItems.length === 0 || isProcessingCheckout) return;
    setIsProcessingCheckout(true);

    try {
      const { accessToken } = getSessionSnapshot();
      const response = await createPosCheckout(
        {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: method,
          note:
            method === "cash" ? `Cash: $${cashReceived} received` : "POS sale",
          customer: { fullName: "Walk-in Customer", phone: "000000000" },
        },
        accessToken!,
      );

      if (method === "cash") {
        const result = getRecord(response.data);
        toast.success("Cash Sale Complete");
        printReceipt(
          typeof result?.orderNumber === "string"
            ? result.orderNumber
            : typeof result?.receiptId === "string"
              ? result.receiptId
              : "POS-SALE",
          cashReceived,
        );
        setCartItems([]);
        setIsCashModalOpen(false);
        refetch();
      } else {
        const normalizedPayment = normalizePosPaymentSession(response);
        if (!normalizedPayment) {
          throw new Error("POS checkout returned an unexpected payment payload");
        }

        setPaymentSession(normalizedPayment);
        const expiresAt = new Date(normalizedPayment.expiresAt).getTime();
        setRemainingMs(Math.max(0, expiresAt - Date.now()));
        countdownIntervalRef.current = window.setInterval(() => {
          const diff = expiresAt - Date.now();
          setRemainingMs(Math.max(0, diff));
        }, 1000);
        pollIntervalRef.current = window.setInterval(
          () => checkStatus(normalizedPayment.paymentId),
          3000,
        );
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const { accessToken } = getSessionSnapshot();
      const response = await getPosPaymentStatus(id, accessToken!);
      const res = normalizePosPaymentStatus(response);
      const currentStatus = String(res?.status || "").toLowerCase();
      if (["failed", "expired", "timeout"].includes(currentStatus))
        return clearPayment();

      if (currentStatus === "paid" || res?.receiptNumber) {
        stopTimers();
        printReceipt(
          (typeof res?.orderNumber === "string" && res.orderNumber) ||
            (typeof res?.receiptNumber === "string" && res.receiptNumber) ||
            paymentSession?.orderNumber ||
            id,
        );
        setCartItems([]);
        clearPayment();
        toast.success("Payment Complete");
        refetch();
      }
    } catch (e: unknown) {
      const err = e as { status?: number };
      if (err?.status === 404 || err?.status === 400) return;
    }
  };

  const handleCancelPayment = async () => {
    if (isCancellingPayment) {
      return;
    }

    if (!paymentSession?.paymentId) {
      clearPayment();
      return;
    }

    const { accessToken } = getSessionSnapshot();
    if (!accessToken) {
      toast.error("Not authenticated");
      return;
    }

    setIsCancellingPayment(true);

    try {
      await cancelPosPayment(paymentSession.paymentId, accessToken);
      toast.success("Payment cancelled. Stock released.");
      clearPayment();
      refetch();
    } catch (err: unknown) {
      setIsCancellingPayment(false);
      toast.error(
        err instanceof Error ? err.message : "Unable to cancel payment",
      );
    }
  };
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          Scan barcodes or select items manually.
        </p>
      </div>

      <PageAlertMessage alert={pageAlert} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="flex h-auto w-full sm:w-auto justify-start gap-3 bg-transparent p-0 overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="sell"
            className="rounded-full border px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-full border px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Sale history
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="sell"
          className="mt-2 grid grid-cols-1 gap-6 lg:min-h-[calc(100vh-220px)] lg:grid-cols-12"
        >
          <div className="flex min-h-0 flex-col gap-4 lg:col-span-8">
            <Card className="shadow-sm border-dashed shrink-0">
              <CardContent className="pt-6">
                <ProductSearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  onBarcodeScan={(code) => {
                    const cleaned = code.trim().toLowerCase();
                    const p = products.find(
                      (x: Product) =>
                        x.imei?.toLowerCase() === cleaned ||
                        x.id.toLowerCase() === cleaned,
                    );
                    if (p) {
                      addProductToCart(p);
                      setSearchValue("");
                    } else {
                      toast.error("Not found", { description: cleaned });
                    }
                  }}
                />
              </CardContent>
            </Card>

            <div className="min-h-0 flex-1">
              <QuickSelectGrid
                products={products}
                loading={loadingProducts}
                onAddProduct={addProductToCart}
              />
            </div>
          </div>

          <div className="lg:col-span-4 lg:self-start">
            <CartPanel
              cartItems={cartItems}
              cartSubtotal={cartSubtotal}
              isProcessingCheckout={isProcessingCheckout}
              checkoutLabel={t("payAndPrintReceipt")}
              onRemoveItem={(id) =>
                setCartItems((prev) => prev.filter((i) => i.id !== id))
              }
              onUpdateQuantity={(id, q) =>
                setCartItems((prev) =>
                  prev.map((i) =>
                    i.id === id ? { ...i, quantity: 1 } : i,
                  ),
                )
              }
              onCheckout={() => performCheckout("bakong")}
              onCashCheckout={() => setIsCashModalOpen(true)}
            />
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-2">
          <SalesHistoryPanel />
        </TabsContent>
      </Tabs>

      <CashPaymentModal
        open={isCashModalOpen}
        onOpenChange={setIsCashModalOpen}
        total={cartSubtotal}
        loading={isProcessingCheckout}
        onConfirm={(v: number) => performCheckout("cash", v)}
      />
      <PaymentModal
        paymentSession={paymentSession}
        remainingMs={remainingMs}
        isCancelling={isCancellingPayment}
        onCheckStatus={checkStatus}
        onCancel={handleCancelPayment}
      />
      <Toaster position="top-center" offset={20} />
    </div>
  );
}
