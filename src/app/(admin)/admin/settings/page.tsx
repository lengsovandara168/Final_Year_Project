"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save, Store, Bell, Shield, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "PhoneShop",
    email: "contact@phoneshop.com",
    phone: "+1 234 567 890",
    address: "123 Main Street, Los Angeles, CA 90001",
    currency: "USD",
    timezone: "America/Los_Angeles",
  });

  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    lowStockAlerts: true,
    emailDigest: false,
    smsAlerts: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-sm text-gray-500">Manage your store settings and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <CardTitle>Store Information</CardTitle>
            </div>
            <CardDescription>
              Basic information about your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Store Name
                </label>
                <Input
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Phone Number
                </label>
                <Input
                  value={storeSettings.phone}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Currency
                </label>
                <select
                  value={storeSettings.currency}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, currency: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Store Address
              </label>
              <Input
                value={storeSettings.address}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, address: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "orderNotifications",
                label: "Order Notifications",
                description: "Get notified when new orders are placed",
              },
              {
                key: "lowStockAlerts",
                label: "Low Stock Alerts",
                description: "Receive alerts when products are running low",
              },
              {
                key: "emailDigest",
                label: "Daily Email Digest",
                description: "Receive a daily summary of store activity",
              },
              {
                key: "smsAlerts",
                label: "SMS Alerts",
                description: "Get critical alerts via SMS",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]:
                        !notifications[item.key as keyof typeof notifications],
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications]
                      ? "bg-black"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[item.key as keyof typeof notifications]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Password
              </label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  New Password
                </label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Confirm Password
                </label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <Button variant="outline">Change Password</Button>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <CardDescription>
              Configure accepted payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Credit Card", enabled: true },
              { name: "PayPal", enabled: true },
              { name: "Bank Transfer", enabled: false },
              { name: "Cash on Delivery", enabled: true },
            ].map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between py-2"
              >
                <p className="font-medium">{method.name}</p>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
