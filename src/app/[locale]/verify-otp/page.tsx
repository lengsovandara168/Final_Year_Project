"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { login, verifyLoginOtp, verifyRegisterOtp, type ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { locales } from "@/i18n/routing";

type VerifyFlow = "register" | "login";

function getLocalePrefix(pathname: string | null) {
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const firstSegment = segments[0];
  const hasLocale = firstSegment
    ? (locales as readonly string[]).includes(firstSegment)
    : false;
  return hasLocale ? `/${firstSegment}` : "/en";
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login: setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [flow, setFlow] = useState<VerifyFlow>("register");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");
    const queryFlow = searchParams.get("flow");
    const storedFlow = localStorage.getItem("verifyFlow");
    const resolvedFlow: VerifyFlow =
      queryFlow === "login" || storedFlow === "login" ? "login" : "register";

    if (!storedEmail) {
      const localePrefix = getLocalePrefix(pathname);
      router.push(`${localePrefix}/${resolvedFlow === "login" ? "login" : "register"}`);
      return;
    }

    setEmail(storedEmail);
    setFlow(resolvedFlow);
  }, [pathname, router, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      setIsLoading(false);
      return;
    }

    try {
      const response =
        flow === "login"
          ? await verifyLoginOtp({ email, code })
          : await verifyRegisterOtp({ email, code });

      setSession({
        userId: response.userId,
        email: response.email,
        role: response.role,
        accessToken: response.accessToken,
        name: response.email.split("@")[0] || "User",
      });

      setSuccess("OTP verified successfully. Redirecting...");
      localStorage.removeItem("verifyEmail");
      localStorage.removeItem("verifyFlow");

      const localePrefix = getLocalePrefix(pathname);
      const postLoginRedirect = localStorage.getItem("postLoginRedirect");
      if (postLoginRedirect) {
        localStorage.removeItem("postLoginRedirect");
      }

      setTimeout(() => {
        if (postLoginRedirect?.startsWith("/")) {
          router.push(postLoginRedirect);
          return;
        }
        if (response.role === "admin") {
          router.push(`${localePrefix}/admin`);
          return;
        }
        router.push(`${localePrefix}/users`);
      }, 800);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please start from login or register again.");
      return;
    }

    try {
      if (flow === "login") {
        await login({ email });
        setSuccess("A new OTP has been sent to your email.");
      } else {
        setSuccess("Please use the OTP sent during registration.");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Verify OTP</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        {error ? (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              name="code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={handleResend}
          >
            Resend
          </button>
        </p>
      </Card>
    </div>
  );
}
