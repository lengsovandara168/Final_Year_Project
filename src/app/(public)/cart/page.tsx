"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/contexts/shop-context";
import { formatPrice } from "@/lib/shop-data";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Home,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
    setPendingAction,
  } = useShop();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setPendingAction(() => () => {
        window.location.href = "/checkout";
      });
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = "/checkout";
  };

  const shippingCost = cartTotal >= 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shippingCost + tax;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black font-medium">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Shopping Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                    <span className="text-2xl font-bold text-gray-400">
                      {item.product.brand.charAt(0)}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="hover:underline"
                    >
                      <p className="text-xs text-gray-500 uppercase">
                        {item.product.brand}
                      </p>
                      <h3 className="font-semibold text-sm md:text-base truncate">
                        {item.product.model}
                      </h3>
                    </Link>
                    <p className="font-bold text-lg mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Continue Shopping */}
          <div className="pt-4">
            <Button asChild variant="outline">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {shippingCost === 0 ? (
                <p className="text-xs text-green-600 text-center">
                  🎉 You qualify for free shipping!
                </p>
              ) : (
                <p className="text-xs text-gray-500 text-center">
                  Add {formatPrice(100 - cartTotal)} more for free shipping
                </p>
              )}

              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-gray-500">
                Secure checkout powered by Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
