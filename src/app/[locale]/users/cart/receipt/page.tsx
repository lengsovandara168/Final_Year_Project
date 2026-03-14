"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { type OrderSummaryV2 } from "@/lib/api";
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
          <CardHeader><CardTitle>Receipt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              No receipt data found. Please complete an order first.
            </p>
            <Button className="w-full" onClick={() => router.push("/users")}>
              Back to Shop
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

  const handleDownloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("LDHS", 10, y); y += 8;
    doc.setFontSize(12);
    doc.text("Order Receipt", 10, y); y += 12;
    doc.setFontSize(11);
    doc.text(`Order Number: ${orderSummary.orderNumber}`, 10, y); y += 6;
    doc.text(`Order Date: ${createdAtFormatted}`, 10, y); y += 6;
    doc.text(`Order Time: ${createdAtTime}`, 10, y); y += 6;
    doc.text("Payment Status: Completed", 10, y); y += 10;

    doc.text("Customer Information", 10, y); y += 6;
    doc.text(`Name: ${orderSummary.shippingAddress.fullName}`, 10, y); y += 6;
    doc.text(`Phone: ${orderSummary.shippingAddress.phone}`, 10, y); y += 10;

    doc.text("Items", 10, y); y += 6;
    orderSummary.items.forEach((item) => {
      const imeiSuffix = item.imei ? ` [IMEI: ${item.imei}]` : "";
      doc.text(
        `${item.name}${imeiSuffix} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`,
        10, y
      );
      y += 6;
    });

    y += 4;
    doc.text(`Subtotal: ${formatPrice(orderSummary.subtotal)}`, 10, y); y += 6;
    doc.text(`Shipping: ${formatPrice(orderSummary.shipping)}`, 10, y); y += 6;
    if (orderSummary.tradeInTotal > 0) {
      doc.text(`Trade-in Credit: -${formatPrice(orderSummary.tradeInTotal)}`, 10, y); y += 6;
    }
    doc.text(`Grand Total: ${formatPrice(orderSummary.grandTotal)}`, 10, y); y += 8;

    doc.text("Payments", 10, y); y += 6;
    orderSummary.payments.forEach((line) => {
      const ref = line.reference ? ` (${line.reference})` : "";
      doc.text(`${line.method.toUpperCase()} - ${formatPrice(line.amount)}${ref}`, 10, y);
      y += 6;
    });
    doc.text(`Amount Paid: ${formatPrice(orderSummary.amountPaid)}`, 10, y); y += 6;
    doc.text(`Change Due: ${formatPrice(orderSummary.changeDue)}`, 10, y);

    doc.save(`${orderSummary.orderNumber}-receipt.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold">LDHS</CardTitle>
              <p className="text-sm text-gray-500">Order Receipt</p>
            </div>
            <Badge>Payment Complete</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Order Number:</span> {orderSummary.orderNumber}</p>
              <p><span className="font-medium">Order Date:</span> {createdAtFormatted}</p>
              <p><span className="font-medium">Order Time:</span> {createdAtTime}</p>
            </section>

            <section className="text-sm text-gray-700 space-y-1">
              <h2 className="font-semibold text-base mb-1">Customer Information</h2>
              <p><span className="font-medium">Name:</span> {orderSummary.shippingAddress.fullName}</p>
              <p><span className="font-medium">Phone:</span> {orderSummary.shippingAddress.phone}</p>
              <p>
                <span className="font-medium">Shipping Address:</span>{" "}
                {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city}{" "}
                {orderSummary.shippingAddress.zipCode}
              </p>
            </section>

            <section className="text-sm text-gray-700 space-y-1">
              <h2 className="font-semibold text-base mb-1">Financial Summary</h2>
              <p><span className="font-medium">Subtotal:</span> {formatPrice(orderSummary.subtotal)}</p>
              <p><span className="font-medium">Shipping:</span> {formatPrice(orderSummary.shipping)}</p>
              {orderSummary.tradeInTotal > 0 && (
                <p>
                  <span className="font-medium">Trade-in Credit:</span>{" "}
                  -{formatPrice(orderSummary.tradeInTotal)}
                </p>
              )}
              <p><span className="font-medium">Grand Total:</span> {formatPrice(orderSummary.grandTotal)}</p>
              <p><span className="font-medium">Amount Paid:</span> {formatPrice(orderSummary.amountPaid)}</p>
              <p><span className="font-medium">Change Due:</span> {formatPrice(orderSummary.changeDue)}</p>
            </section>

            {orderSummary.tradeIns.length > 0 && (
              <section className="text-sm text-gray-700 space-y-1">
                <h2 className="font-semibold text-base mb-1">Trade-in</h2>
                {orderSummary.tradeIns.map((tradeIn) => (
                  <p key={tradeIn.id}>
                    <span className="font-medium">{tradeIn.model}</span>
                    {tradeIn.imei ? ` (IMEI: ${tradeIn.imei})` : ""} &mdash;{" "}
                    <span className="text-green-700">-{formatPrice(tradeIn.offeredAmount)}</span>
                  </p>
                ))}
              </section>
            )}

            <section className="text-sm text-gray-700 space-y-1">
              <h2 className="font-semibold text-base mb-1">Payments</h2>
              {orderSummary.payments.map((line) => (
                <p key={line.id}>
                  <span className="font-medium uppercase">{line.method}</span>:{" "}
                  {formatPrice(line.amount)}
                  {line.reference ? ` (${line.reference})` : ""}
                </p>
              ))}
            </section>

            <section className="text-sm text-gray-700">
              <h2 className="font-semibold text-base mb-2">Items</h2>
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderSummary.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-55">
                          <div>
                            <span className="font-medium line-clamp-2">{item.name}</span>
                            {item.imei && (
                              <p className="text-xs text-gray-500 mt-1">IMEI: {item.imei}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-3 text-sm font-semibold">
                <span className="mr-2">Grand Total:</span>
                <span>{formatPrice(orderSummary.grandTotal)}</span>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/users")}
              >
                Back to Shop
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button className="w-full sm:w-auto" onClick={handleDownloadPdf}>
                  Download PDF Receipt
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => router.push("/users/cart")}>
                  Back to Cart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
