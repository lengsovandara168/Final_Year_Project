"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { type OrderSummaryV2 } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptSummary } from "@/components/receipt/ReceiptSummary";
import {
  generateReceiptPrintHtml,
  printReceiptHtml,
} from "@/components/receipt/receipt-print";
import { useTranslations } from "next-intl";

type LegacyOrderSummary = {
  orderNumber: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  total: number;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function toV2Summary(legacy: LegacyOrderSummary): OrderSummaryV2 {
  return {
    orderNumber: legacy.orderNumber,
    createdAt: legacy.createdAt,
    items: legacy.items,
    shippingAddress: legacy.shippingAddress,
    subtotal: legacy.total,
    shipping: 0,
    tradeIns: [],
    tradeInTotal: 0,
    grandTotal: legacy.total,
    payments: [
      {
        id: "legacy-payment",
        method: "khqr",
        amount: legacy.total,
      },
    ],
    amountPaid: legacy.total,
    changeDue: 0,
  };
}

export default function ReceiptPage() {
  const t = useTranslations("Receipt");
  const router = useRouter();
  const [orderSummary, setOrderSummary] = useState<OrderSummaryV2 | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawV2 = window.localStorage.getItem("lastOrderSummaryV2");
    if (rawV2) {
      try {
        setOrderSummary(JSON.parse(rawV2) as OrderSummaryV2);
        return;
      } catch {
        // ignore parse errors
      }
    }

    const rawLegacy = window.localStorage.getItem("lastOrderSummary");
    if (!rawLegacy) return;

    try {
      setOrderSummary(toV2Summary(JSON.parse(rawLegacy) as LegacyOrderSummary));
    } catch {
      // ignore
    }
  }, []);

  if (!orderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{t("missingData")}</p>
            <Button className="w-full" onClick={() => router.push("/users")}>
              {t("backToShop")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createdAtDate = new Date(orderSummary.createdAt);
  const createdAtFormatted = createdAtDate.toLocaleDateString("en-GB");
  const createdAtTime = createdAtDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrintReceipt = () => {
    const html = generateReceiptPrintHtml(orderSummary, {
      brandName: "LDHS",
      title: "Order Receipt",
    });
    printReceiptHtml(html);
  };

  const handleDownloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("LDHS", 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text("Order Receipt", 10, y);

    y += 12;
    doc.setFontSize(11);
    doc.text(`Order Number: ${orderSummary.orderNumber}`, 10, y);
    y += 6;
    doc.text(`Order Date: ${createdAtFormatted}`, 10, y);
    y += 6;
    doc.text(`Order Time: ${createdAtTime}`, 10, y);
    y += 6;
    doc.text("Payment Status: Completed", 10, y);

    y += 10;
    doc.setFontSize(11);
    doc.text("Customer Information", 10, y);
    y += 6;
    doc.text(`Name: ${orderSummary.shippingAddress.fullName}`, 10, y);
    y += 6;
    doc.text(`Phone: ${orderSummary.shippingAddress.phone}`, 10, y);
    y += 6;
    doc.text(
      `Address: ${orderSummary.shippingAddress.address}, ${orderSummary.shippingAddress.city} ${orderSummary.shippingAddress.zipCode}`,
      10,
      y,
    );

    y += 10;
    doc.setFontSize(11);
    doc.text("Items", 10, y);
    y += 6;
    orderSummary.items.forEach((item) => {
      const imeiSuffix = item.imei ? ` [IMEI: ${item.imei}]` : "";
      doc.text(
        `${item.name}${imeiSuffix} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`,
        10,
        y,
      );
      y += 6;
    });

    y += 4;
    doc.text(`Order Total: ${formatPrice(orderSummary.grandTotal)}`, 10, y);

    doc.save(`${orderSummary.orderNumber}-receipt.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold">LDHS</CardTitle>
              <p className="text-sm text-gray-500">{t("orderReceipt")}</p>
            </div>
            <Badge>{t("paymentComplete")}</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReceiptSummary
              orderSummary={orderSummary}
              formatPrice={formatPrice}
              itemsTitle={t("items")}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/users")}
              >
                {t("backToShop")}
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleDownloadPdf}
                >
                  {t("downloadPdf")}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/users/cart")}
                >
                  {t("backToCart")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
