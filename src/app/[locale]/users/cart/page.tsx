"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/contexts/cart-context";
import {
  createDraftOrderSummary,
  generatePaymentLine,
  calculatePaymentsTotal,
  type OrderSummaryV2,
  type ShippingAddress,
  type PaymentLine,
  type TradeInItem,
} from "@/lib/api";
import { normalizeAmount } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ChevronLeft,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

type CheckoutStep = "cart" | "shipping" | "payment" | "confirmation";

type TradeInForm = {
  model: string;
  imei: string;
  offeredAmount: string;
};

export default function CartPage() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryV2 | null>(null);
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([
    generatePaymentLine(0, "khqr"),
  ]);
  const [tradeInEnabled, setTradeInEnabled] = useState(false);
  const [tradeInForm, setTradeInForm] = useState<TradeInForm>({
    model: "",
    imei: "",
    offeredAmount: "",
  });

  const stepOrder: CheckoutStep[] = ["cart", "shipping", "payment"];
  const isCartComplete = items.length > 0;
  const isShippingComplete = !!(
    shippingAddress.fullName.trim() &&
    shippingAddress.phone.trim() &&
    shippingAddress.address.trim() &&
    shippingAddress.city.trim()
  );

  let maxAvailableStepIndex = 0; // cart is always available
  if (isCartComplete) maxAvailableStepIndex = 1; // shipping available
  if (isShippingComplete) maxAvailableStepIndex = 2; // payment available

  const handleStepClick = (target: CheckoutStep) => {
    if (target === step) return;
    const targetIndex = stepOrder.indexOf(target);

    if (targetIndex !== -1 && targetIndex <= maxAvailableStepIndex) {
      setShowErrors(false);
      setStep(target);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tradeInAmount = tradeInEnabled
    ? normalizeAmount(Number(tradeInForm.offeredAmount) || 0)
    : 0;
  const total = normalizeAmount(
    Math.max(subtotal + shipping - tradeInAmount, 0),
  );
  const totalPaid = calculatePaymentsTotal(paymentLines);
  const paymentShortfall = normalizeAmount(Math.max(total - totalPaid, 0));
  const changeDue = normalizeAmount(Math.max(totalPaid - total, 0));

  const resetPaymentLines = (nextTotal: number) => {
    setPaymentLines([generatePaymentLine(nextTotal, "khqr")]);
  };

  const updatePaymentLine = (lineId: string, patch: Partial<PaymentLine>) => {
    setPaymentLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    );
  };

  const removePaymentLine = (lineId: string) => {
    setPaymentLines((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((line) => line.id !== lineId);
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (step === "cart" && items.length > 0) {
      setShowErrors(false);
      setPaymentError(null);
      setStep("shipping");
    } else if (step === "shipping") {
      // Validate shipping
      const isValid =
        shippingAddress.fullName.trim() &&
        shippingAddress.phone.trim() &&
        shippingAddress.address.trim() &&
        shippingAddress.city.trim();

      if (!isValid) {
        setShowErrors(true);
        return;
      }
      setShowErrors(false);
      resetPaymentLines(total);
      setPaymentError(null);
      setStep("payment");
    } else if (step === "payment") {
      const sanitizedPayments = paymentLines.map((line) => ({
        ...line,
        amount: normalizeAmount(line.amount),
      }));

      if (sanitizedPayments.some((line) => line.amount <= 0)) {
        setPaymentError("Each payment line must be greater than $0.00.");
        return;
      }

      if (paymentShortfall > 0) {
        setPaymentError(
          `Insufficient payment. You still need ${formatPrice(paymentShortfall)}.`,
        );
        return;
      }

      const orderItems = items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imei: item.product.imei,
      }));

      const tradeIns: TradeInItem[] =
        tradeInEnabled && tradeInAmount > 0
          ? [
              {
                id: `tradein-${Date.now()}`,
                model: tradeInForm.model.trim() || "Used phone",
                imei: tradeInForm.imei.trim() || undefined,
                offeredAmount: tradeInAmount,
              },
            ]
          : [];

      const summary = createDraftOrderSummary({
        items: orderItems,
        shippingAddress: { ...shippingAddress },
        subtotal,
        shipping,
        tradeIns,
        payments: sanitizedPayments,
      });

      setOrderSummary(summary);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "lastOrderSummaryV2",
          JSON.stringify(summary),
        );
      }
      setShowErrors(false);
      setPaymentError(null);
      setStep("confirmation");
      clearCart();
    }
  };

  const handleViewReceipt = () => {
    if (!orderSummary) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "lastOrderSummaryV2",
        JSON.stringify(orderSummary),
      );
      const receiptPath = window.location.pathname.replace(
        "/users/cart",
        `/users/cart/receipt?order=${encodeURIComponent(orderSummary.orderNumber)}`,
      );
      window.open(receiptPath, "_blank");
    }
  };

  // Confirmation page
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t("confirmedTitle")}</h2>
            {orderSummary && (
              <>
                  <p className="text-gray-600 mb-4">
                    {t("confirmedMessage")}
                  </p>
                  <Button onClick={handleViewReceipt} className="w-full mb-3">
                    {t("viewReceipt")}
                  </Button>
              </>
            )}
            <Button onClick={() => router.push("/users")} className="w-full" variant={orderSummary ? "outline" : "default"}>
              {t("continueShopping")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === "cart") router.push("/users");
                  else if (step === "shipping") setStep("cart");
                  else if (step === "payment") setStep("shipping");
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">
                {step === "cart" && t("shoppingCart")}
                {step === "shipping" && t("shippingAddress")}
                {step === "payment" && t("payment")}
              </h1>
            </div>

            {/* Breadcrumb Steps */}
            <div className="hidden md:block">
              <Breadcrumb>
                <BreadcrumbList>
                  {/* Cart step */}
                  <BreadcrumbItem>
                    {step === "cart" ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm">{t("cart")}</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          onClick={() => handleStepClick("cart")}
                          className="flex items-center gap-1 text-sm"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{t("cart")}</span>
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  <BreadcrumbSeparator />

                  {/* Shipping step */}
                  <BreadcrumbItem>
                    {step === "shipping" ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{t("shipping")}</span>
                      </BreadcrumbPage>
                    ) : maxAvailableStepIndex >=
                      stepOrder.indexOf("shipping") ? (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          onClick={() => handleStepClick("shipping")}
                          className="flex items-center gap-1 text-sm"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>{t("shipping")}</span>
                        </button>
                      </BreadcrumbLink>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
                        <MapPin className="h-4 w-4" />
                        <span>{t("shipping")}</span>
                      </span>
                    )}
                  </BreadcrumbItem>

                  <BreadcrumbSeparator />

                  {/* Payment step */}
                  <BreadcrumbItem>
                    {step === "payment" ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm">{t("payment")}</span>
                      </BreadcrumbPage>
                    ) : maxAvailableStepIndex >=
                      stepOrder.indexOf("payment") ? (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          onClick={() => handleStepClick("payment")}
                          className="flex items-center gap-1 text-sm"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{t("payment")}</span>
                        </button>
                      </BreadcrumbLink>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
                        <CreditCard className="h-4 w-4" />
                        <span>{t("payment")}</span>
                      </span>
                    )}
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 && step === "cart" ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">{t("emptyTitle")}</h2>
              <p className="text-gray-500 mb-6">{t("emptyMessage")}</p>
              <Button onClick={() => router.push("/users")}>
                {t("continueShopping")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Cart Items / Forms */}
            <div className="flex-1 space-y-4">
              {step === "cart" && (
                <>
                  {items.map((item) => (
                    <Card key={item.product.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {[item.product.storage, item.product.color]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                            <p className="font-bold mt-2">
                              {formatPrice(item.product.price)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {step === "shipping" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("shippingAddress")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("fullName")} <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.fullName.trim() ? t("requiredField") : "Chan Thida"}
                          value={shippingAddress.fullName}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              fullName: e.target.value,
                            })
                          }
                          className={
                            showErrors && !shippingAddress.fullName.trim()
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("phoneNumber")} <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.phone.trim() ? t("requiredField") : "012 345 678"}
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              phone: e.target.value,
                            })
                          }
                          className={
                            showErrors && !shippingAddress.phone.trim()
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("streetAddress")} <span className="text-red-500">*</span></label>
                      <Input
                        placeholder={showErrors && !shippingAddress.address.trim() ? t("requiredField") : "Toul Songkae No.12 streat 99"}
                        value={shippingAddress.address}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            address: e.target.value,
                          })
                        }
                        className={
                          showErrors && !shippingAddress.address.trim()
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("cityProvince")} <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.city.trim() ? t("requiredField") : "Phnom Penh"}
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              city: e.target.value,
                            })
                          }
                          className={
                            showErrors && !shippingAddress.city.trim()
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("zipCode")}</label>
                        <Input
                          placeholder="10001"
                          value={shippingAddress.zipCode}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CardTitle className="h-5 w-5" />
                      {t("paymentTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Split Payments</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPaymentLines((prev) => [
                              ...prev,
                              generatePaymentLine(0, "cash"),
                            ])
                          }
                        >
                          Add Split
                        </Button>
                      </div>

                      {paymentLines.map((line, index) => (
                        <div
                          key={line.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded-lg p-3"
                        >
                          <div className="md:col-span-4">
                            <label className="block text-xs font-medium mb-1">
                              Method
                            </label>
                            <select
                              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                              value={line.method}
                              onChange={(e) =>
                                updatePaymentLine(line.id, {
                                  method: e.target
                                    .value as PaymentLine["method"],
                                })
                              }
                            >
                              <option value="khqr">KHQR</option>
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                            </select>
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-xs font-medium mb-1">
                              Amount
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.amount}
                              onChange={(e) =>
                                updatePaymentLine(line.id, {
                                  amount: normalizeAmount(
                                    Number(e.target.value) || 0,
                                  ),
                                })
                              }
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium mb-1">
                              Reference
                            </label>
                            <Input
                              placeholder="Txn ID (optional)"
                              value={line.reference ?? ""}
                              onChange={(e) =>
                                updatePaymentLine(line.id, {
                                  reference: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              disabled={paymentLines.length <= 1}
                              onClick={() => removePaymentLine(line.id)}
                              aria-label={`Remove payment line ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Trade-in (Optional)</h3>
                        <Button
                          type="button"
                          variant={tradeInEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTradeInEnabled((prev) => !prev)}
                        >
                          {tradeInEnabled ? "Enabled" : "Enable"}
                        </Button>
                      </div>

                      {tradeInEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Device model"
                            value={tradeInForm.model}
                            onChange={(e) =>
                              setTradeInForm((prev) => ({
                                ...prev,
                                model: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Trade-in IMEI"
                            value={tradeInForm.imei}
                            onChange={(e) =>
                              setTradeInForm((prev) => ({
                                ...prev,
                                imei: e.target.value,
                              }))
                            }
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Offer amount"
                            value={tradeInForm.offeredAmount}
                            onChange={(e) =>
                              setTradeInForm((prev) => ({
                                ...prev,
                                offeredAmount: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    {paymentError && (
                      <p className="text-sm text-red-600">{paymentError}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items Summary */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600 truncate max-w-50">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("subtotal")}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
<<<<<<< HEAD
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
=======
                      <span className="text-gray-600">{t("shippingCost")}</span>
                      <span>{shipping === 0 ? t("free") : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053
                    </div>
                    {tradeInAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Trade-in Credit</span>
                        <span>-{formatPrice(tradeInAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("total")}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {shipping === 0 && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {t("freeShippingBadge")}
                      </Badge>
                    )}
                  </div>

                  {step === "payment" && (
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid</span>
                        <span>{formatPrice(totalPaid)}</span>
                      </div>
                      {paymentShortfall > 0 ? (
                        <div className="flex justify-between text-amber-700 font-medium">
                          <span>Remaining</span>
                          <span>{formatPrice(paymentShortfall)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-green-700 font-medium">
                          <span>Change Due</span>
                          <span>{formatPrice(changeDue)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shipping Address Summary (shown in payment step) */}
                  {step === "payment" && (
                    <div className="border-t pt-4">
<<<<<<< HEAD
                      <p className="text-sm font-medium mb-2">
                        {t("shippingTo")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Name: {shippingAddress.fullName}
                        <br />
                        Tel: {shippingAddress.phone} <br />
                        Address: {shippingAddress.address}
                        <br />
                        City/Province: {shippingAddress.city},{" "}
                        {shippingAddress.zipCode}
                        <br />
=======
                      <p className="text-sm font-medium mb-2">{t("shippingTo")}</p>
                      <p className="text-sm text-gray-600">
                        {t("stockEntryName")}: {shippingAddress.fullName}<br />
                        {t("tel")}: {shippingAddress.phone} <br />
                        {t("address")}: {shippingAddress.address}<br />
                        {t("cityProvince")}: {shippingAddress.city}, {shippingAddress.zipCode}<br />
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={
                      (step === "cart" && items.length === 0) ||
                      (step === "payment" && paymentShortfall > 0)
                    }
                  >
                    {step === "cart" && t("proceedToCheckout")}
                    {step === "shipping" && t("continueToPayment")}
                    {step === "payment" && t("payAmount", { amount: formatPrice(total) })}
                  </Button>

                  {step === "cart" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/users")}
                    >
                      {t("continueShopping")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
