"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { register, type ApiError } from "@/lib/api";
import { locales } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function getLocalePrefix(pathname: string | null) {
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const firstSegment = segments[0];
  const hasLocale = firstSegment
    ? (locales as readonly string[]).includes(firstSegment)
    : false;
  return hasLocale ? `/${firstSegment}` : "/en";
}

export default function RegisterPage() {
  const t = useTranslations("AuthRegister");
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail) {
      setError(t("nameEmailRequired"));
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: normalizedEmail,
        name: normalizedName,
      });

      localStorage.setItem("verifyEmail", normalizedEmail);
      localStorage.setItem("verifyFlow", "register");
      localStorage.setItem("verifyName", normalizedName);

      const localePrefix = getLocalePrefix(pathname);
      router.push(`${localePrefix}/verify-otp?flow=register`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || t("registerFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("title")}</h1>

        {error ? (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t("name")}
            </label>
            <Input
              id="name"
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t("email")}
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? t("registering") : t("register")}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href={`${getLocalePrefix(pathname)}/login`}
            className="text-blue-600 hover:underline"
          >
            {t("loginHere")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
