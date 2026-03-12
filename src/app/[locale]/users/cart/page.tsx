"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/contexts/cart-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle,
} from "lucide-react";

type CheckoutStep = "cart" | "shipping" | "payment" | "confirmation";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [showErrors, setShowErrors] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (step === "cart" && items.length > 0) {
      setShowErrors(false);
      setStep("shipping");
    } else if (step === "shipping") {
      // Validate shipping
      const isValid = 
        shippingAddress.fullName.trim() && 
        shippingAddress.phone.trim() && 
        shippingAddress.address.trim() && 
        shippingAddress.city.trim() && 
        shippingAddress.country.trim();
      
      if (!isValid) {
        setShowErrors(true);
        return;
      }
      setShowErrors(false);
      setStep("payment");
    } else if (step === "payment") {
      // Validate payment
      if (paymentMethod === "card") {
        const isValid = 
          cardInfo.cardNumber.trim() && 
          cardInfo.cardName.trim() && 
          cardInfo.expiryDate.trim() && 
          cardInfo.cvv.trim();
        
        if (!isValid) {
          setShowErrors(true);
          return;
        }
      }
      // Process payment
      setStep("confirmation");
      clearCart();
    }
  };

  // Confirmation page
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Order confirmation has been sent to your email.
            </p>
            <Button onClick={() => router.push("/users")} className="w-full">
              Continue Shopping
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
              <Button variant="ghost" size="icon" onClick={() => {
                if (step === "cart") router.push("/users");
                else if (step === "shipping") setStep("cart");
                else if (step === "payment") setStep("shipping");
              }}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">
                {step === "cart" && "Shopping Cart"}
                {step === "shipping" && "Shipping Address"}
                {step === "payment" && "Payment"}
              </h1>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-2">
              <div className={`flex items-center gap-1 ${step === "cart" ? "text-black" : "text-gray-400"}`}>
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Cart</span>
              </div>
              <ChevronLeft className="h-4 w-4 rotate-180 text-gray-300" />
              <div className={`flex items-center gap-1 ${step === "shipping" ? "text-black" : "text-gray-400"}`}>
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Shipping</span>
              </div>
              <ChevronLeft className="h-4 w-4 rotate-180 text-gray-300" />
              <div className={`flex items-center gap-1 ${step === "payment" ? "text-black" : "text-gray-400"}`}>
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Payment</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 && step === "cart" ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some products to your cart to continue shopping.</p>
              <Button onClick={() => router.push("/users")}>
                Continue Shopping
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
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                            <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {[item.product.storage, item.product.color].filter(Boolean).join(" • ")}
                            </p>
                            <p className="font-bold mt-2">{formatPrice(item.product.price)}</p>
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
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
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
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.fullName.trim() ? "Please fill in this field" : "John Doe"}
                          value={shippingAddress.fullName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                          className={showErrors && !shippingAddress.fullName.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.phone.trim() ? "Please fill in this field" : "+1 234 567 8900"}
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className={showErrors && !shippingAddress.phone.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address <span className="text-red-500">*</span></label>
                      <Input
                        placeholder={showErrors && !shippingAddress.address.trim() ? "Please fill in this field" : "123 Main Street, Apt 4B"}
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className={showErrors && !shippingAddress.address.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
                        <Input
                          placeholder={showErrors && !shippingAddress.city.trim() ? "Please fill in this field" : "New York"}
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className={showErrors && !shippingAddress.city.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State/Province</label>
                        <Input
                          placeholder="NY"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">ZIP Code</label>
                        <Input
                          placeholder="10001"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Country <span className="text-red-500">*</span></label>
                      <Input
                        placeholder={showErrors && !shippingAddress.country.trim() ? "Please fill in this field" : "United States"}
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className={showErrors && !shippingAddress.country.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                          paymentMethod === "card" ? "border-black bg-gray-50" : "border-gray-200"
                        }`}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <CreditCard className="h-6 w-6 mb-2" />
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                      </button>
                      <button
                        type="button"
                        className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                          paymentMethod === "cod" ? "border-black bg-gray-50" : "border-gray-200"
                        }`}
                        onClick={() => setPaymentMethod("cod")}
                      >
                        <Truck className="h-6 w-6 mb-2" />
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </button>
                    </div>

                    {/* Card Details */}
                    {paymentMethod === "card" && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium mb-1">Card Number <span className="text-red-500">*</span></label>
                          <Input
                            placeholder={showErrors && !cardInfo.cardNumber.trim() ? "Please fill in this field" : "1234 5678 9012 3456"}
                            value={cardInfo.cardNumber}
                            onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                            className={showErrors && !cardInfo.cardNumber.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Cardholder Name <span className="text-red-500">*</span></label>
                          <Input
                            placeholder={showErrors && !cardInfo.cardName.trim() ? "Please fill in this field" : "JOHN DOE"}
                            value={cardInfo.cardName}
                            onChange={(e) => setCardInfo({ ...cardInfo, cardName: e.target.value })}
                            className={showErrors && !cardInfo.cardName.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date <span className="text-red-500">*</span></label>
                            <Input
                              placeholder={showErrors && !cardInfo.expiryDate.trim() ? "Please fill in this field" : "MM/YY"}
                              value={cardInfo.expiryDate}
                              onChange={(e) => setCardInfo({ ...cardInfo, expiryDate: e.target.value })}
                              className={showErrors && !cardInfo.expiryDate.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">CVV <span className="text-red-500">*</span></label>
                            <Input
                              type="password"
                              placeholder={showErrors && !cardInfo.cvv.trim() ? "Please fill in this field" : "123"}
                              maxLength={4}
                              value={cardInfo.cvv}
                              onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                              className={showErrors && !cardInfo.cvv.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          You will pay {formatPrice(total)} when your order is delivered.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items Summary */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[200px]">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {shipping === 0 && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Free shipping on orders over $100
                      </Badge>
                    )}
                  </div>

                  {/* Shipping Address Summary (shown in payment step) */}
                  {step === "payment" && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Shipping to:</p>
                      <p className="text-sm text-gray-600">
                        {shippingAddress.fullName}<br />
                        {shippingAddress.address}<br />
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                        {shippingAddress.country}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={step === "cart" && items.length === 0}
                  >
                    {step === "cart" && "Proceed to Checkout"}
                    {step === "shipping" && "Continue to Payment"}
                    {step === "payment" && `Pay ${formatPrice(total)}`}
                  </Button>

                  {step === "cart" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/users")}
                    >
                      Continue Shopping
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
