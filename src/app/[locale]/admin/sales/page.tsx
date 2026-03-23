"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// API & Helpers
import { getSessionSnapshot } from "@/lib/auth-session";
import { getBakongPaymentStatus, getAdminProducts } from "@/lib/api";
import { createPosCheckout } from "@/lib/api/pos";
import {
  generateReceiptPrintHtml,
  printReceiptHtml,
} from "@/components/receipt/receipt-print";

// Custom Components
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ManualProductPicker } from "./components/ManualProductPicker";
import {
  PageAlertMessage,
  type PageAlertState,
} from "./components/PageAlertMessage";
import { CartItem } from "./components/CartItemList";
import { QuickSelectGrid } from "./components/QuickSelectGrid";
import { CartPanel } from "./components/CartPanel";
import { PaymentModal } from "./components/PaymentModal";
import { SalesHistoryPanel } from "./components/SaleHistoryPanel";
import { CashPaymentModal } from "./components/cashPaymentModal";

export default function SalesPage() {
  const t = useTranslations("AdminSales");

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("sell");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
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
      generateReceiptPrintHtml(summary as any, {
        brandName: "LDHS",
        title: "Receipt",
      }),
    );
  };

  // --- HANDLERS ---
  const addProductToCart = (product: any) => {
    if (!product.inStock) {
      toast.error("Out of stock");
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          barcode: product.imei ?? undefined,
        },
      ];
    });
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

      const result = response.data;

      if (method === "cash") {
        toast.success("Cash Sale Complete");
        printReceipt(result.orderNumber || result.receiptId!, cashReceived);
        setCartItems([]);
        setIsCashModalOpen(false);
        refetch(); // Update stock counts
      } else {
        setPaymentSession(result);
        const expiresAt = Date.now() + 3 * 60 * 1000;
        countdownIntervalRef.current = window.setInterval(() => {
          const diff = expiresAt - Date.now();
          setRemainingMs(Math.max(0, diff));
        }, 1000);
        pollIntervalRef.current = window.setInterval(
          () => checkStatus(result.paymentId!),
          3000,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const { accessToken } = getSessionSnapshot();
      const res = await getBakongPaymentStatus(id, accessToken!);
      const currentStatus = String(res.status).toLowerCase();
      if (["failed", "expired", "timeout"].includes(currentStatus))
        return clearPayment();

      if (currentStatus === "paid" || res.receiptNumber) {
        stopTimers();
        printReceipt(res.orderId || id);
        setCartItems([]);
        clearPayment();
        toast.success("Payment Complete");
        refetch();
      }
    } catch (e: any) {
      if (e?.status === 404 || e?.status === 400) return;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
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
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2"
        >
          <div className="lg:col-span-8 flex flex-col gap-4">
            <Card className="shadow-sm border-dashed shrink-0">
              <CardContent className="pt-6">
                <ProductSearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  onBarcodeScan={(code) => {
                    const cleaned = code.trim().toLowerCase();
                    const p = products.find(
                      (x: any) =>
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

            <QuickSelectGrid
              products={products}
              loading={loadingProducts}
              onAddProduct={addProductToCart}
            />
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-6">
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
                  prev.map((i) => (i.id === id ? { ...i, quantity: q } : i)),
                )
              }
              onCheckout={() => performCheckout("bakong")}
              onCashCheckout={() => setIsCashModalOpen(true)}
            />
          </div>
        </TabsContent>
        <TabsContent value="history">
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
        onCheckStatus={checkStatus}
        onCancel={clearPayment}
      />
      <Toaster />
    </div>
  );
}
