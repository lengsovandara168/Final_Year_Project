"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Loader2, ShieldUser } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { locales } from "@/i18n/routing";
import { getSessionSnapshot } from "@/lib/auth-session";
import { createStaffUser } from "@/lib/api";

function toErrorMessage(
  error: unknown,
  defaultMessage: string = "Something went wrong.",
) {
  if (error && typeof error === "object" && "error" in error) {
    return String((error as { error?: unknown }).error ?? "Unknown error");
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }

  return defaultMessage;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type StaffAccountsPageProps = {
  locale: string;
};

export default function StaffAccountsPage({
  locale,
}: StaffAccountsPageProps) {
  const t = useTranslations("AdminStaffAccounts");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ensureAccessToken = useCallback(async () => {
    const token = getSessionSnapshot().accessToken;
    if (token) {
      return token;
    }

    const hasLocale = (locales as readonly string[]).includes(locale);
    const next = `${window.location.pathname}${window.location.search}`;
    router.push(
      `${hasLocale ? `/${locale}` : "/en"}/login?next=${encodeURIComponent(next)}`,
    );
    return null;
  }, [locale, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setError(t("emailRequired"));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError(t("invalidEmail"));
      return;
    }

    if (!trimmedName) {
      setError(t("nameRequired"));
      return;
    }

    const accessToken = await ensureAccessToken();
    if (!accessToken) {
      return;
    }

    try {
      setIsSubmitting(true);

      await createStaffUser(
        {
          email: trimmedEmail,
          name: trimmedName,
        },
        accessToken,
      );

      setEmail("");
      setName("");
      setSuccess(
        t("createdDescription", {
          name: trimmedName,
          email: trimmedEmail,
        }),
      );
    } catch (submissionError) {
      setError(toErrorMessage(submissionError, t("createFailed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-gray-500 md:text-base">{t("subtitle")}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{t("createFailed")}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">{t("success")}</p>
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t("formTitle")}</CardTitle>
            <CardDescription>{t("formDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="staff-email" className="text-sm font-medium">
                  {t("email")} <span className="text-red-600">*</span>
                </label>
                <Input
                  id="staff-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="staff-name" className="text-sm font-medium">
                  {t("name")} <span className="text-red-600">*</span>
                </label>
                <Input
                  id="staff-name"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("creatingStaff")}
                    </>
                  ) : (
                    t("createStaff")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-gradient-to-b from-white to-gray-50">
          <CardHeader>
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-black text-white">
              <ShieldUser className="h-5 w-5" />
            </div>
            <CardTitle>{t("flowTitle")}</CardTitle>
            <CardDescription>{t("flowDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>{t("flowStepOne")}</p>
            <p>{t("flowStepTwo")}</p>
            <p>{t("flowStepThree")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
