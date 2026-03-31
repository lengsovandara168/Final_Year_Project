"use client";

import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.name ?? "";
  const email = user?.email ?? "";

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Name</p>
              <Input value={name} disabled readOnly />
              <p className="text-xs text-gray-500 break-words">Name cannot be edited.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <Input value={email} disabled readOnly />
              <p className="text-xs text-gray-500 break-words">Email cannot be edited.</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/users")}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
