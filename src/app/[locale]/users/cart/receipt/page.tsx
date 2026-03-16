"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { type OrderSummaryV2 } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptSummary } from "@/components/receipt/ReceiptSummary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
<<<<<<< HEAD
            <p className="text-sm text-gray-600">{t("missingData")}</p>
=======
            <p className="text-sm text-gray-600">
              {t("missingData")}
            </p>
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053
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
    doc.text(t("orderReceipt"), 10, y);

    y += 12;
    doc.setFontSize(11);
    doc.text(`${t("orderNumber")} ${orderSummary.orderNumber}`, 10, y);
    y += 6;
    doc.text(`${t("orderDate")} ${createdAtFormatted}`, 10, y);
    y += 6;
    doc.text(`${t("orderTime")} ${createdAtTime}`, 10, y);
    y += 6;
    doc.text(t("paymentStatusCompleted"), 10, y);

    y += 10;
    doc.setFontSize(11);
    doc.text(t("customerInformation"), 10, y);
    y += 6;
    doc.text(`${t("name")} ${orderSummary.shippingAddress.fullName}`, 10, y);
    y += 6;
    doc.text(`${t("phone")} ${orderSummary.shippingAddress.phone}`, 10, y);
    y += 6;
    doc.text(
      `${t("shippingAddress")} ${orderSummary.shippingAddress.address}, ${orderSummary.shippingAddress.city} ${orderSummary.shippingAddress.zipCode}`,
      10,
      y,
    );

    y += 10;
    doc.setFontSize(11);
    doc.text(t("items"), 10, y);
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
<<<<<<< HEAD
    doc.text(`Order Total: ${formatPrice(orderSummary.grandTotal)}`, 10, y);
=======
    doc.text(`${t("orderTotal")} ${formatPrice(orderSummary.total)}`, 10, y);
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053

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
<<<<<<< HEAD
            <ReceiptSummary
              orderSummary={orderSummary}
              formatPrice={formatPrice}
              itemsTitle={t("items")}
            />
=======
            <section className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">{t("orderNumber")}</span> {orderSummary.orderNumber}
              </p>
              <p>
                <span className="font-medium">{t("orderDate")}</span> {createdAtFormatted}
              </p>
              <p>
                <span className="font-medium">{t("orderTime")}</span> {createdAtTime}
              </p>
            </section>

            <section className="text-sm text-gray-700 space-y-1">
              <h2 className="font-semibold text-base mb-1">{t("customerInformation")}</h2>
              <p>
                <span className="font-medium">{t("name")}</span> {orderSummary.shippingAddress.fullName}
              </p>
              <p>
                <span className="font-medium">{t("phone")}</span> {orderSummary.shippingAddress.phone}
              </p>
              <p>
                <span className="font-medium">{t("shippingAddress")}</span> {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city}{" "}
                {orderSummary.shippingAddress.zipCode}
              </p>
            </section>

            <section className="text-sm text-gray-700">
              <h2 className="font-semibold text-base mb-2">{t("items")}</h2>
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("item")}</TableHead>
                      <TableHead className="text-right">{t("quantity")}</TableHead>
                      <TableHead className="text-right">{t("pricePerUnit")}</TableHead>
                      <TableHead className="text-right">{t("totalPrice")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderSummary.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[220px]">
                          <span className="font-medium line-clamp-2">{item.name}</span>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-3 text-sm font-semibold">
                <span className="mr-2">{t("orderTotal")}</span>
                <span>{formatPrice(orderSummary.total)}</span>
              </div>
            </section>
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/users")}
              >
                {t("backToShop")}
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
<<<<<<< HEAD
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
=======
                <Button className="w-full sm:w-auto" onClick={handleDownloadPdf}>
                  {t("downloadPdf")}
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => router.push("/users/cart")}>
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053
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
