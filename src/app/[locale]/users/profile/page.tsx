"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfilePage() {
  const router = useRouter();
  const session = getSessionSnapshot();
  const initialEmail = session.user?.email ?? "";
  const [email] = useState(initialEmail);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
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
