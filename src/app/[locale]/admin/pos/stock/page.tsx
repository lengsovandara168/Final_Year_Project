"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { getSessionSnapshot } from "@/lib/auth-session";
import {
  addStock,
  getStockHistory,
  getStockLevels,
  type StockLevel,
  type StockHistory,
  type AddStockRequest,
} from "@/lib/api/pos";
import { getProducts, type Product } from "@/lib/api/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockBarcodeForm } from "../components/StockBarcodeForm";
import { StockBatchList } from "../components/StockBatchList";
import { StockHistoryTable } from "../components/StockHistoryTable";
import { StockLevelsDashboard } from "../components/StockLevelsDashboard";

export default function POSStockPage() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  const [batchItems, setBatchItems] = useState<Array<{
    id: string;
    productId: string;
    brand: string;
    model: string;
    quantity: number;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "add" | "history">(
    "add",
  );

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = getSessionSnapshot();
        if (!session.accessToken) {
          router.push("/login");
          return;
        }

        // Fetch products for form
        const productsResult = await getProducts(session.accessToken);
        if (productsResult.ok && productsResult.data) {
          setProducts(productsResult.data);
        }

        // Fetch stock levels
        const levelsResult = await getStockLevels(session.accessToken);
        if (levelsResult.ok && levelsResult.data) {
          setStockLevels(levelsResult.data);
        }

        // Fetch stock history
        const historyResult = await getStockHistory(session.accessToken);
        if (historyResult.ok && historyResult.data) {
          setStockHistory(historyResult.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load stock data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle adding item to batch
  const handleAddToBatch = (item: {
    productId: string;
    brand: string;
    model: string;
    quantity: number;
  }) => {
    // Check if product already exists in batch
    const existingItem = batchItems.find(
      (batchItem) => batchItem.productId === item.productId,
    );

    if (existingItem) {
      // Increment quantity if product exists
      setBatchItems(
        batchItems.map((batchItem) =>
          batchItem.productId === item.productId
            ? { ...batchItem, quantity: batchItem.quantity + item.quantity }
            : batchItem,
        ),
      );
    } else {
      // Add new item to batch
      setBatchItems([
        ...batchItems,
        {
          id: `${item.productId}-${Date.now()}`,
          ...item,
        },
      ]);
    }
  };

  // Handle removing item from batch
  const handleRemoveFromBatch = (id: string) => {
    setBatchItems(batchItems.filter((item) => item.id !== id));
  };

  // Handle editing item quantity
  const handleEditBatchItem = (id: string) => {
    const item = batchItems.find((batchItem) => batchItem.id === id);
    if (item) {
      // Remove the item so user can re-add with new quantity
      handleRemoveFromBatch(id);
    }
  };

  // Handle submitting entire batch
  const handleSubmitBatch = async () => {
    if (batchItems.length === 0) {
      setError("No items in batch to submit");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const session = getSessionSnapshot();
      if (!session.accessToken) {
        router.push("/login");
        return;
      }

      // Submit each item in the batch
      let successCount = 0;
      for (const item of batchItems) {
        const result = await addStock(session.accessToken, {
          productId: item.productId,
          quantity: item.quantity,
          adjustmentType: "addition",
        });

        if (result.ok) {
          successCount++;
        }
      }

      if (successCount === batchItems.length) {
        setSuccessMessage(
          `Successfully added ${batchItems.length} products to inventory`,
        );
        setBatchItems([]); // Clear batch

        // Refresh stock levels and history
        const levelsResult = await getStockLevels(session.accessToken);
        if (levelsResult.ok && levelsResult.data) {
          setStockLevels(levelsResult.data);
        }

        const historyResult = await getStockHistory(session.accessToken);
        if (historyResult.ok && historyResult.data) {
          setStockHistory(historyResult.data);
        }

        // Show success for 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        setActiveTab("dashboard");
      } else {
        setError(
          `${successCount}/${batchItems.length} items added. Some items failed.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle stock addition (old single item method)
  const handleAddStock = async (data: AddStockRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const session = getSessionSnapshot();
      if (!session.accessToken) {
        router.push("/login");
        return;
      }

      const result = await addStock(session.accessToken, data);

      if (result.ok && result.data) {
        setSuccessMessage(result.message);

        // Refresh stock levels and history
        const levelsResult = await getStockLevels(session.accessToken);
        if (levelsResult.ok && levelsResult.data) {
          setStockLevels(levelsResult.data);
        }

        const historyResult = await getStockHistory(session.accessToken);
        if (historyResult.ok && historyResult.data) {
          setStockHistory(historyResult.data);
        }

        // Show success for 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // Switch to dashboard tab to show updated levels
        setActiveTab("dashboard");
      } else {
        setError(result.error?.message || "Failed to add stock");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
          <p className="text-gray-600">Loading stock management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-gray-600 mt-2">
          Track and manage product inventory levels
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "dashboard"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Stock Levels
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "add"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Add Stock
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <StockLevelsDashboard
          levels={stockLevels}
          isLoading={loading}
        />
      )}

      {activeTab === "add" && (
        <div className="space-y-6">
          {/* Barcode Form */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Stock Check-In</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Select category, brand, and model to add items to your batch.
                Same products will automatically increase quantity.
              </p>
            </CardHeader>
            <CardContent>
              <StockBarcodeForm
              onAddToBatchAction={handleAddToBatch}
              isLoading={submitting}
            />
          </CardContent>
        </Card>

        {/* Batch List */}
        <StockBatchList
          items={batchItems}
          onRemoveAction={handleRemoveFromBatch}
          onEditAction={handleEditBatchItem}
        />

        {/* Submit Batch Button */}
        {batchItems.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleSubmitBatch}
              disabled={submitting}
              className="flex-1 h-11 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit Batch (${batchItems.length} product${batchItems.length !== 1 ? "s" : ""})`
              )}
            </button>
            <button
              onClick={() => setBatchItems([])}
              disabled={submitting}
              className="h-11 px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-900 font-medium rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        )}
        </div>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Adjustment History</CardTitle>
          </CardHeader>
          <CardContent>
            <StockHistoryTable
              history={stockHistory}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
