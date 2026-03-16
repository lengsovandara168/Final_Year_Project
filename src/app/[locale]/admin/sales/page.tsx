"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { getSessionSnapshot } from "@/lib/auth-session";
import {
  createOrder,
  getProducts,
  Product,
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { accessToken } = getSessionSnapshot();
  if (!accessToken) throw new Error("Not authenticated");

  const res = await getProducts(accessToken);
  return Array.isArray(res.data) ? res.data : [];
};

export default function SalesPage() {
  const t = useTranslations("AdminSales");
  const [activeTab, setActiveTab] = useState<ActiveTab>("sell");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const [manualPopoverOpen, setManualPopoverOpen] = useState(false);
  const [manualSearch, setManualSearch] = useState("");

  const [pageAlert, setPageAlert] = useState<PageAlertState | null>(null);

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

  const addProductToCart = useCallback((product: Product) => {
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
          barcode: product.imei,
        },
      ];
    });
    toast.success(t("addedToCart"), {
      description: product.name,
    });
  }, [t]);

  const filteredManualProducts = useMemo(() => {
    const query = manualSearch.trim().toLowerCase();
    if (!query) return products.slice(0, 10);

    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.imei && p.imei.toLowerCase().includes(query)),
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

      addProductToCart(found);
    },
    [products, addProductToCart, t],
  );

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(t("itemRemoved"));
  }, [t]);

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
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

  const handlePayAndPrintReceipt = useCallback(async () => {
    if (cartItems.length === 0 || isProcessingCheckout) {
      return;
    }

    try {
      setIsProcessingCheckout(true);

      const { accessToken } = getSessionSnapshot();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await createOrder(
        {
          customerName: "Walk-in Customer",
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            imei: item.barcode,
          })),
          shippingAmount: 0,
          payments: [{ method: "cash", amount: cartSubtotal }],
        },
        accessToken,
      );

      toast.success(t("paymentCompleteTitle"), {
        description: t("paymentCompleteDesc", {
          orderNumber: response.data.orderNumber,
        }),
      });
      setPageAlert({
        title: t("paymentCompleteTitle"),
        description: t("paymentCompleteDesc", {
          orderNumber: response.data.orderNumber,
        }),
        variant: "default",
      });

      const orderSummary: OrderSummaryV2 = {
        orderNumber: response.data.orderNumber,
        createdAt: response.data.createdAt,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imei: item.barcode,
        })),
        shippingAddress: {
          fullName: "Walk-in Customer",
          phone: "N/A",
          address: "In-store",
          city: "Phnom Penh",
          zipCode: "00000",
        },
        subtotal: cartSubtotal,
        shipping: 0,
        tradeIns: [],
        tradeInTotal: 0,
        grandTotal: cartSubtotal,
        payments: [
          { id: "payment-cash", method: "cash", amount: cartSubtotal },
        ],
        amountPaid: response.data.paid,
        changeDue: response.data.changeDue,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "lastOrderSummaryV2",
          JSON.stringify(orderSummary),
        );
      }

      const receiptHtml = generateReceiptPrintHtml(orderSummary, {
        brandName: "LDHS",
        title: t("receiptTitle"),
      });
      printReceiptHtml(receiptHtml);

      setCartItems([]);
    } catch (error) {
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
  }, [cartItems, cartSubtotal, isProcessingCheckout, t]);

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
              onClick={handlePayAndPrintReceipt}
              disabled={cartItems.length === 0 || isProcessingCheckout}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessingCheckout ? t("processing") : t("payAndPrintReceipt")}
            </Button>
          </div>
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
