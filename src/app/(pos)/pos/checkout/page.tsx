"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  CheckCircle,
  Printer,
  RotateCcw,
} from "lucide-react";

// Sample order data
const orderData = {
  items: [
    { id: "1", name: "iPhone 15 Pro Max", price: 1199, quantity: 1 },
    { id: "7", name: "AirPods Pro", price: 249, quantity: 2 },
    { id: "11", name: "MagSafe Charger", price: 39, quantity: 1 },
  ],
  subtotal: 1736,
  discount: 173.6,
  tax: 156.24,
  total: 1718.64,
};

const paymentMethods = [
  { id: "cash", name: "Cash", icon: Banknote },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "mobile", name: "Mobile Payment", icon: Smartphone },
  { id: "qr", name: "QR Code", icon: QrCode },
];

export default function POSCheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const change = Number(cashReceived) - orderData.total;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const handleNewSale = () => {
    setIsComplete(false);
    setCashReceived("");
    setSelectedMethod("cash");
  };

  if (isComplete) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">Transaction completed successfully</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Order #</span>
                <span className="font-mono">POS-2024-0001</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold">${orderData.total.toFixed(2)}</span>
              </div>
              {selectedMethod === "cash" && change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Change</span>
                  <span className="font-bold">${change.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Payment Method</span>
                <span>{paymentMethods.find((m) => m.id === selectedMethod)?.name}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Link href="/pos" className="flex-1">
                <Button className="w-full" onClick={handleNewSale}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/pos/cart">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Payment Methods */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="font-medium text-sm">{method.name}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Cash Payment Input */}
          {selectedMethod === "cash" && (
            <Card>
              <CardHeader>
                <CardTitle>Cash Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount Received
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="h-14 text-2xl font-bold text-center"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[1720, 1750, 1800, 2000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setCashReceived(amount.toString())}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                {Number(cashReceived) >= orderData.total && (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Change Due</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${change.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card Payment */}
          {selectedMethod === "card" && (
            <Card>
              <CardHeader>
                <CardTitle>Card Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">Ready for Card</p>
                  <p className="text-gray-500">
                    Insert, tap, or swipe the customer&apos;s card
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile Payment */}
          {selectedMethod === "mobile" && (
            <Card>
              <CardHeader>
                <CardTitle>Mobile Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <Smartphone className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Waiting for Mobile Payment
                  </p>
                  <p className="text-gray-500">
                    Customer should tap their phone on the terminal
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Payment */}
          {selectedMethod === "qr" && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 text-center">
                  <div className="inline-block p-4 bg-white border-2 rounded-lg mb-4">
                    <div className="h-48 w-48 bg-gray-200 rounded flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-500">
                    Scan QR code with payment app to complete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${orderData.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full h-14 text-lg"
                onClick={handlePayment}
                disabled={
                  isProcessing ||
                  (selectedMethod === "cash" && Number(cashReceived) < orderData.total)
                }
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
