"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { locales } from "@/i18n/routing";
import { requestOtp } from "@/lib/api";

export default function LoginEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await requestOtp({ email });
      localStorage.setItem("verifyEmail", email);

      const segments = pathname?.split("/").filter(Boolean) ?? [];
      const firstSegment = segments[0];
      const hasLocale = firstSegment
        ? (locales as readonly string[]).includes(firstSegment)
        : false;
      const localePrefix = hasLocale ? `/${firstSegment}` : "";

      setSuccess("OTP sent. Redirecting to verification...");
      const nextPath = searchParams.get("next");
      if (nextPath) {
        localStorage.setItem("postLoginRedirect", nextPath);
      }
      router.push(`${localePrefix}/verify-otp` || "/en/verify-otp");
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        const message = String((err as { message?: string }).message);
        if (message.toLowerCase().includes("already verified")) {
          localStorage.setItem("verifyEmail", email);

          const segments = pathname?.split("/").filter(Boolean) ?? [];
          const firstSegment = segments[0];
          const hasLocale = firstSegment
            ? (locales as readonly string[]).includes(firstSegment)
            : false;
          const localePrefix = hasLocale ? `/${firstSegment}` : "";

          setSuccess("Email already verified. Continue to OTP verification...");
          const nextPath = searchParams.get("next");
          if (nextPath) {
            localStorage.setItem("postLoginRedirect", nextPath);
          }
          router.push(`${localePrefix}/verify-otp` || "/en/verify-otp");
          return;
        }
        setError(message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you an OTP to verify.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
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
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
