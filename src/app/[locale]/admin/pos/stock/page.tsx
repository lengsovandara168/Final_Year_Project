"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  PackageOpen,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionSnapshot } from "@/lib/auth-session";
import { locales } from "@/i18n/routing";
import {
  addStock,
  getStockHistory,
  getStockLevels,
  type StockHistory,
  type StockLevel,
} from "@/lib/api/pos";
import {
  StockBarcodeForm,
  StockBatchList,
  StockHistoryTable,
  StockLevelsDashboard,
  type BatchItem,
} from "../components";

type ActiveTab = "add" | "history" | "levels";

function getBatchItemKey(item: BatchItem) {
  return item.imei ? `imei:${item.imei}` : `pid:${item.productId}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

export default function PosStockPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>("add");
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const locale = pathname?.split("/").filter(Boolean)[0] ?? "en";

  const ensureAccessToken = useCallback(async () => {
    const token = getSessionSnapshot().accessToken;
    if (token) return token;
    const hasLocale = (locales as readonly string[]).includes(locale);
    router.push(`${hasLocale ? `/${locale}` : "/en"}/login`);
    return null;
  }, [locale, router]);

  const loadHistoryAndLevels = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    if (!accessToken) return;
    try {
      setIsLoading(true);
      setError(null);
      const [historyRes, levelsRes] = await Promise.all([
        getStockHistory(accessToken),
        getStockLevels(accessToken),
      ]);
      setStockHistory(historyRes.data);
      setStockLevels(levelsRes.data);
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to load stock data. Please try again.",
      );
      setError(message);
      console.warn("Failed to load stock data:", message);
    } finally {
      setIsLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    void loadHistoryAndLevels();
  }, [loadHistoryAndLevels]);

  const handleAddToBatch = (item: {
    productId: string;
    category: "phones" | "tablets" | "accessories";
    brand: string;
    model: string;
    quantity: number;
    imei?: string;
  }) => {
    setBatchItems((prev) => {
      if (item.imei) {
        const alreadyExists = prev.some((b) => b.imei === item.imei);
        if (alreadyExists) {
          setError(`IMEI ${item.imei} already exists in pending batch.`);
          return prev;
        }
        return [...prev, { ...item, quantity: 1 }];
      }

      const existing = prev.find((b) => !b.imei && b.productId === item.productId);
      if (existing) {
        return prev.map((b) =>
          !b.imei && b.productId === item.productId
            ? { ...b, quantity: b.quantity + item.quantity }
            : b,
        );
      }
      return [...prev, item];
    });
  };

  const handleRemoveFromBatch = (itemKey: string) => {
    setBatchItems((prev) => prev.filter((b) => getBatchItemKey(b) !== itemKey));
  };

  const handleUpdateQuantity = (itemKey: string, quantity: number) => {
    setBatchItems((prev) =>
      prev.map((b) => {
        if (getBatchItemKey(b) !== itemKey) return b;
        if (b.imei) return { ...b, quantity: 1 };
        return { ...b, quantity };
      }),
    );
  };

  const handleSubmitBatch = async () => {
    if (batchItems.length === 0) return;
    const accessToken = await ensureAccessToken();
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await Promise.all(
        batchItems.map((item) =>
          addStock(accessToken, {
            productId: item.productId,
            quantity: item.imei ? 1 : item.quantity,
            adjustmentType: "addition",
            reason: item.imei ? `Stock check-in (IMEI: ${item.imei})` : "Stock check-in",
          }),
        ),
      );

      const count = batchItems.length;
      setBatchItems([]);
      setSuccess(`Successfully checked in ${count} item(s).`);
      await loadHistoryAndLevels();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to submit batch. Please try again.",
      );
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "add", label: "Check In" },
    { key: "history", label: "History" },
    { key: "levels", label: "Stock Levels" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">POS Stock Check-In</h1>
        <p className="text-sm text-gray-500 md:text-base">
          Scan products to batch check-in incoming stock
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Check In tab */}
      {activeTab === "add" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageOpen className="h-5 w-5" />
                Scan Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockBarcodeForm
                onAddToBatchAction={handleAddToBatch}
                isLoading={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Batch ({batchItems.length})</CardTitle>
                <Button
                  onClick={handleSubmitBatch}
                  disabled={isSubmitting || batchItems.length === 0}
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit All
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StockBatchList
                items={batchItems}
                onRemoveAction={handleRemoveFromBatch}
                onUpdateQuantityAction={handleUpdateQuantity}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Stock History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Loading history…
              </div>
            ) : (
              <StockHistoryTable history={stockHistory} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Levels tab */}
      {activeTab === "levels" && (
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Loading levels…
              </div>
            ) : (
              <StockLevelsDashboard levels={stockLevels} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
