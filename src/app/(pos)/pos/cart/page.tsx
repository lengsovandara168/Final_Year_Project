"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";

// Sample cart items (in real app, this would come from context/state)
const initialCartItems = [
  { id: "1", name: "iPhone 15 Pro Max", price: 1199, quantity: 1 },
  { id: "7", name: "AirPods Pro", price: 249, quantity: 2 },
  { id: "11", name: "MagSafe Charger", price: 39, quantity: 1 },
];

export default function POSCartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [discount, setDiscount] = useState(0);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.1; // 10% tax
  const total = subtotal - discountAmount + tax;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/pos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-gray-500">{cartItems.length} items</p>
        </div>
        {cartItems.length > 0 && (
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Cart is empty</h2>
            <p className="text-gray-500 mb-4">Add products to start a new sale</p>
            <Link href="/pos">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                        📱
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-lg font-bold">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-bold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    {index < cartItems.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>

                {/* Discount Input */}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Discount %"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-24"
                    min={0}
                    max={100}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscount(5)}
                  >
                    5%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscount(10)}
                  >
                    10%
                  </Button>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Link href="/pos/checkout" className="block">
                  <Button className="w-full h-14 text-lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
