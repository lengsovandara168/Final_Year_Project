"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/contexts/shop-context";
import {
  User,
  ChevronRight,
  Home,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { isAuthenticated, user } = useShop();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-500 mb-6">
          You need to be logged in to access settings.
        </p>
        <Button asChild>
          <Link href="/">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/account" className="hover:text-black">
          My Account
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black font-medium">Settings</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Account Settings</h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Profile Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  New Password
                </label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications about your orders
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotional Emails</p>
                  <p className="text-sm text-gray-500">
                    Receive emails about deals and new products
                  </p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive text messages for urgent updates
                  </p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Settings saved successfully!
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/account">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
