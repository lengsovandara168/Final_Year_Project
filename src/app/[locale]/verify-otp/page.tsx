"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { requestOtp, verifyOtp } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { locales } from "@/i18n/routing";

export default function VerifyOtpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("verifyEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to register
      router.push("/en/register");
    }
  }, [router]);

  useEffect(() => {
    if (!email || hasRequestedOtp) {
      return;
    }

    setHasRequestedOtp(true);
    requestOtp({ email })
      .then(() => {
        setSuccess("OTP sent. Please check your email.");
      })
      .catch((err) => {
        const apiError = err as ApiError;
        const message = apiError.message || "Failed to send OTP.";
        if (message.toLowerCase().includes("already verified")) {
          setSuccess("Email already verified. You can enter your OTP.");
        } else {
          setError(message);
        }
      });
  }, [email, hasRequestedOtp]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyOtp({
        email,
        code,
      });

      const accessToken = response.access_token;

      if (accessToken) {
        login(
          accessToken,
          {
            id: "",
            email: email,
          },
          response.refresh_token,
        );

        document.cookie = `access_token=${accessToken}; Path=/; SameSite=Lax`;
        if (response.refresh_token) {
          document.cookie = `refresh_token=${response.refresh_token}; Path=/; SameSite=Lax`;
        }
      }

      setSuccess("Email verified successfully! Redirecting...");

      // Clear stored email
      localStorage.removeItem("verifyEmail");

      const segments = pathname?.split("/").filter(Boolean) ?? [];
      const firstSegment = segments[0];
      const hasLocale = firstSegment
        ? (locales as readonly string[]).includes(firstSegment)
        : false;
      const localePrefix = hasLocale ? `/${firstSegment}` : "";
      const postLoginRedirect = localStorage.getItem("postLoginRedirect");
      if (postLoginRedirect) {
        localStorage.removeItem("postLoginRedirect");
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (postLoginRedirect?.startsWith("/")) {
          router.push(postLoginRedirect);
        } else {
          router.push(localePrefix || "/en");
        }
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || "OTP verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Verify Your Email
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          We sent a verification code to <strong>{email}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Code Input */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              name="code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        {/* Resend Code */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={async () => {
              setError("");
              setSuccess("");
              if (!email) {
                setError("Please enter your email first.");
                return;
              }

              try {
                await requestOtp({ email });
                setSuccess("OTP resent. Please check your email.");
              } catch (err) {
                const apiError = err as ApiError;
                const message = apiError.message || "Failed to resend OTP.";
                if (message.toLowerCase().includes("already verified")) {
                  setSuccess("Email already verified. You can enter your OTP.");
                } else {
                  setError(message);
                }
              }
            }}
          >
            Resend
          </button>
        </p>
      </Card>
    </div>
  );
}
