"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import {
  getStoredCheckoutHistory,
  setStoredCheckoutSummary,
  type StoredCheckoutSummary,
} from "@/lib/checkout-storage";
import { formatOrderDisplayId } from "@/lib/order-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatPrice(amount: number, currency: StoredCheckoutSummary["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function UserPurchaseHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<StoredCheckoutSummary[]>([]);

  useEffect(() => {
    const userEmail = getSessionSnapshot().user?.email;
    setHistory(getStoredCheckoutHistory(userEmail));
  }, []);

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [history],
  );

  const viewReceipt = (summary: StoredCheckoutSummary) => {
    setStoredCheckoutSummary(summary);
    router.push("/users/cart/receipt");
  };

  if (sortedHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                No successful orders found yet.
              </p>
              <Button onClick={() => router.push("/users")}>Start Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <Button variant="outline" onClick={() => router.push("/users")}>
            Back
          </Button>
        </div>

        {sortedHistory.map((summary) => {
          const createdAt = new Date(summary.createdAt);

          return (
            <Card key={summary.paymentId}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">Order</p>
                      <p className="font-semibold text-gray-900">
                        {formatOrderDisplayId(
                          summary.receiptNumber || summary.orderId,
                        )}
                      </p>
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        Paid
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Payment ID: {summary.paymentId}</p>
                    <p className="text-sm text-gray-600">
                      Date: {createdAt.toLocaleDateString("en-GB")} {createdAt.toLocaleTimeString("en-GB")}
                    </p>

                    <div className="rounded-md border bg-white">
                      {summary.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 border-b px-3 py-2 text-sm last:border-b-0"
                        >
                          <span className="text-gray-700">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity, summary.currency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="font-semibold text-gray-900">
                      Total: {formatPrice(summary.amount, summary.currency)}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto">
                    <Button onClick={() => viewReceipt(summary)}>View Receipt</Button>
                    <Button variant="outline" onClick={() => router.push("/users")}>
                      Buy Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
