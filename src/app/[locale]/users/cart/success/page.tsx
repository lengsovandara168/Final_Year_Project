"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { getStoredCheckoutSummary, type StoredCheckoutSummary } from "@/lib/checkout-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

function formatPrice(amount: number, currency: StoredCheckoutSummary["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<StoredCheckoutSummary | null>(null);

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const receiptNumber = searchParams.get("receiptNumber");

  useEffect(() => {
    setSummary(getStoredCheckoutSummary());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            <CardTitle className="text-2xl">Payment Confirmed</CardTitle>
            <p className="text-sm text-gray-500">
              Bakong payment was confirmed by the backend.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 rounded-xl border bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="mt-1 break-all font-medium text-gray-900">
                  {orderId ?? summary?.orderId ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payment ID</p>
                <p className="mt-1 break-all font-medium text-gray-900">
                  {paymentId ?? summary?.paymentId ?? "Unavailable"}
                </p>
              </div>
              {(receiptNumber ?? summary?.receiptNumber) && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500">Receipt Number</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {receiptNumber ?? summary?.receiptNumber}
                  </p>
                </div>
              )}
            </div>

            {summary && (
              <div className="space-y-4 rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Order Amount</p>
                  <Badge>{formatPrice(summary.amount, summary.currency)}</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {summary.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4">
                      <span className="truncate">
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity, summary.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push("/users/cart/receipt")}>
                View receipt
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/users")}
              >
                Continue shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
