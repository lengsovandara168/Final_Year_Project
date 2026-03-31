"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import {
  getStoredCheckoutSummary,
  type StoredCheckoutSummary,
} from "@/lib/checkout-storage";
import type { OrderSummaryV2 } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  generateReceiptPrintHtml,
  printReceiptHtml,
} from "@/components/receipt/receipt-print";
import { useTranslations } from "next-intl";
import { formatOrderDisplayId } from "@/lib/order-display";

export default function ReceiptPage() {
  const t = useTranslations("Receipt");
  const router = useRouter();
  const [summary, setSummary] = useState<StoredCheckoutSummary | null>(null);

  useEffect(() => {
    setSummary(getStoredCheckoutSummary());
  }, []);

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              No receipt data found. Complete a payment first.
            </p>
            <Button className="w-full" onClick={() => router.push("/users")}>
              {t("backToShop")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderSummary: OrderSummaryV2 = {
    orderNumber: formatOrderDisplayId(summary.receiptNumber || summary.orderId),
    createdAt: summary.createdAt,
    items: summary.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    shippingAddress: {
      fullName: summary.shipping.fullName,
      phone: summary.shipping.phone,
      address: summary.shipping.addressLine1,
      city: summary.shipping.city ?? "",
      zipCode: summary.shipping.postalCode ?? "",
    },
    subtotal: summary.amount,
    shipping: 0,
    tradeIns: [],
    tradeInTotal: 0,
    grandTotal: summary.amount,
    payments: [
      {
        id: summary.paymentId,
        method: "bakong",
        amount: summary.amount,
        reference: summary.paymentId,
      },
    ],
    amountPaid: summary.amount,
    changeDue: 0,
  };

  const receiptHtml = generateReceiptPrintHtml(orderSummary, {
    brandName: "Astrix",
    title: "Sales Receipt",
  });

  const handleSavePdf = async () => {
    printReceiptHtml(receiptHtml);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-gray-900">{t("orderReceipt")}</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => router.push("/users")}>
              {t("backToShop")}
            </Button>
            <Button onClick={handleSavePdf}>
              Save as PDF
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <iframe
            title="Sales Receipt"
            srcDoc={receiptHtml}
            className="h-[860px] w-full"
          />
        </div>
      </div>
    </div>
  );
}
