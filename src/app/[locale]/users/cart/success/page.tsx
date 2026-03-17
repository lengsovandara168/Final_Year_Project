"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import {
  getStoredCheckoutSummary,
  type StoredCheckoutSummary,
} from "@/lib/checkout-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, ReceiptText, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

type PaymentSummary = {
  orderId: string | null;
  paymentId: string | null;
  receiptNumber: string | null;
};

function buildFallbackSummary(
  searchParams: ReturnType<typeof useSearchParams>,
): PaymentSummary {
  return {
    orderId: searchParams.get("orderId"),
    paymentId: searchParams.get("paymentId"),
    receiptNumber: searchParams.get("receiptNumber"),
  };
}

export default function CartSuccessPage() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<StoredCheckoutSummary | null>(null);

  useEffect(() => {
    setSummary(getStoredCheckoutSummary());
  }, []);

  const fallbackSummary = buildFallbackSummary(searchParams);
  const orderId = summary?.orderId ?? fallbackSummary.orderId;
  const paymentId = summary?.paymentId ?? fallbackSummary.paymentId;
  const receiptNumber = summary?.receiptNumber ?? fallbackSummary.receiptNumber;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <Badge className="mb-3 bg-emerald-600 text-white hover:bg-emerald-600">
              Payment Complete
            </Badge>
            <CardTitle className="text-2xl">{t("confirmedTitle")}</CardTitle>
            <p className="max-w-lg text-sm text-gray-600">{t("confirmedMessage")}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-2xl border bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Payment details</p>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Order ID</span>
                  <span className="text-right font-medium text-gray-900">
                    {orderId ?? "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="text-right font-medium text-gray-900">
                    {paymentId ?? "Unavailable"}
                  </span>
                </div>
                {receiptNumber && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Receipt Number</span>
                    <span className="text-right font-medium text-gray-900">
                      {receiptNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={() => router.push("/users/cart/receipt")}
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                {t("viewReceipt")}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/users")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t("continueShopping")}
              </Button>
            </div>

            {!summary && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Receipt details were not found in local storage. You can still continue,
                but the receipt page may be empty if this tab was refreshed before data was
                stored.
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/users/cart/receipt")}
              className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("viewReceipt")}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
