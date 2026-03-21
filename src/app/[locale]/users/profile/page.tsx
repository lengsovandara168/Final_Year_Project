"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSessionSnapshot, updateSessionUser } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function UserProfilePage() {
  const router = useRouter();
  const session = getSessionSnapshot();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialName = session.user?.name ?? "User";
  const initialEmail = session.user?.email ?? "";
  const initialPhoto = session.user?.profilePhotoUrl ?? "";

  const [name, setName] = useState(initialName);
  const [email] = useState(initialEmail);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialPhoto);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const initials = useMemo(() => getInitials(name || initialName), [name, initialName]);

  const onChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const onPhotoChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfilePhotoUrl(result);
      setError(null);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    updateSessionUser({
      name: trimmedName,
      profilePhotoUrl: profilePhotoUrl || undefined,
    });

    setName(trimmedName);
    setError(null);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={profilePhotoUrl} alt="Profile photo" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onChoosePhoto}
                  className="w-full sm:w-auto"
                >
                  Change Profile Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Name</p>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <Input value={email} disabled readOnly />
              <p className="text-xs text-gray-500 break-words">Email cannot be edited.</p>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {saved ? <p className="text-sm text-green-600">Profile updated.</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <Button type="button" onClick={onSave} className="w-full sm:w-auto">
                Save Changes
              </Button>
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
