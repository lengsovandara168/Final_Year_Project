"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { locales } from "@/i18n/routing";
import { login } from "@/lib/api";
import { useTranslations } from "next-intl";
<<<<<<< HEAD
import path from "path";
=======
>>>>>>> 8b49610be250be80e6a05025dbb85980c084a053

export default function LoginPage() {
  const t = useTranslations("AuthLogin");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const pathLocale = pathname?.split("/").filter(Boolean)[0];
  const localePrefix = pathLocale ? `/${pathLocale}` : "/en";

  const localePrefix = pathname ? `/${path.basename(pathname)}` : "/en";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const normalizedEmail = email.trim();

    try {
      await login({ email: normalizedEmail });
      localStorage.setItem("verifyEmail", normalizedEmail);
      localStorage.setItem("verifyFlow", "login");

      const segments = pathname?.split("/").filter(Boolean) ?? [];
      const firstSegment = segments[0];
      const hasLocale = firstSegment
        ? (locales as readonly string[]).includes(firstSegment)
        : false;
      const localePrefix = hasLocale ? `/${firstSegment}` : "/en";

      setSuccess(t("otpSentRedirecting"));
      const nextPath = searchParams.get("next");
      if (nextPath) {
        localStorage.setItem("postLoginRedirect", nextPath);
      }
      router.push(`${localePrefix}/verify-otp?flow=login`);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError(String((err as { message?: string }).message));
      } else {
        setError(t("loginFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="email"
            >
              {t("email")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              {success}
            </p>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("sendingOtp") : t("sendOtp")}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-4 text-sm text-muted-foreground">
          {t("registerPrompt")}{" "}
          <Link
            href={`${localePrefix}/register`}
            className="text-blue-600 hover:underline font-medium"
          >
            {t("registerHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}
