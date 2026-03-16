"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import {
  getStoredCheckoutSummary,
  type StoredCheckoutSummary,
} from "@/lib/checkout-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

function formatPrice(
  amount: number,
  currency: StoredCheckoutSummary["currency"],
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

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

  const createdAtDate = new Date(summary.createdAt);
  const createdAtFormatted = createdAtDate.toLocaleDateString("en-GB");
  const createdAtTime = createdAtDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
    doc.text(`Order ID: ${summary.orderId}`, 10, y);
    y += 6;
    doc.text(`Payment ID: ${summary.paymentId}`, 10, y);
    y += 6;
    if (summary.receiptNumber) {
      doc.text(`Receipt Number: ${summary.receiptNumber}`, 10, y);
      y += 6;
    }
    doc.text(`Order Date: ${createdAtFormatted}`, 10, y);
    y += 6;
    doc.text(`${t("orderTime")} ${createdAtTime}`, 10, y);
    y += 6;
    doc.text(t("paymentStatusCompleted"), 10, y);

    y += 10;
    doc.text("Customer Information", 10, y);
    y += 6;
    doc.text(`Name: ${summary.shipping.fullName}`, 10, y);
    y += 6;
    doc.text(`Phone: ${summary.shipping.phone}`, 10, y);
    y += 6;
    doc.text(`Address: ${summary.shipping.addressLine1}`, 10, y);
    if (summary.shipping.notes) {
      y += 6;
      doc.text(`Notes: ${summary.shipping.notes}`, 10, y);
    }

    y += 10;
    doc.text("Items", 10, y);
    y += 6;
    summary.items.forEach((item) => {
      doc.text(
        `${item.name} × ${item.quantity} - ${formatPrice(item.price * item.quantity, summary.currency)}`,
        10,
        y,
      );
      y += 6;
    });

    y += 4;
    doc.text(
      `Order Total: ${formatPrice(summary.amount, summary.currency)}`,
      10,
      y,
    );

    doc.save(`${summary.orderId}-receipt.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-bold">LDHS</CardTitle>
              <p className="text-sm text-gray-500">{t("orderReceipt")}</p>
            </div>
            <Badge>{t("paymentComplete")}</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Order ID:</span> {summary.orderId}
              </p>
              <p>
                <span className="font-medium">Payment ID:</span> {summary.paymentId}
              </p>
              {summary.receiptNumber && (
                <p>
                  <span className="font-medium">Receipt Number:</span>{" "}
                  {summary.receiptNumber}
                </p>
              )}
              <p>
                <span className="font-medium">Order Date:</span> {createdAtFormatted}
              </p>
              <p>
                <span className="font-medium">{t("orderTime")}</span> {createdAtTime}
              </p>
            </section>

            <section className="space-y-1 text-sm text-gray-700">
              <h2 className="mb-1 text-base font-semibold">Customer Information</h2>
              <p>
                <span className="font-medium">Name:</span> {summary.shipping.fullName}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {summary.shipping.phone}
              </p>
              <p>
                <span className="font-medium">Shipping Address:</span>{" "}
                {summary.shipping.addressLine1}
              </p>
              {summary.shipping.notes && (
                <p>
                  <span className="font-medium">Notes:</span> {summary.shipping.notes}
                </p>
              )}
            </section>

            <section className="text-sm text-gray-700">
              <h2 className="mb-2 text-base font-semibold">Items</h2>
              <div className="overflow-hidden rounded-lg border bg-white">
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
                    {summary.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[220px]">
                          <span className="line-clamp-2 font-medium">
                            {item.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price, summary.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.price * item.quantity, summary.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex justify-end text-sm font-semibold">
                <span className="mr-2">Order Total:</span>
                <span>{formatPrice(summary.amount, summary.currency)}</span>
              </div>
            </section>

            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/users")}
              >
                {t("backToShop")}
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={handleDownloadPdf}>
                  {t("downloadPdf")}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => router.push("/users/cart/success")}
                >
                  Back to Success
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
