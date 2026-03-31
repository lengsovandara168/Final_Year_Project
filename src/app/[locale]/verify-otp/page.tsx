"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getMe,
  login,
  verifyLoginOtp,
  verifyRegisterOtp,
  type ApiError,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { locales } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { RefreshCwIcon } from "lucide-react";
import { getFirstStaffAdminPath } from "@/lib/rbac";
import { getRememberedUserName } from "@/lib/auth-session";

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
  const t = useTranslations("AuthVerifyOtp");
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
  const [isResendOpen, setIsResendOpen] = useState(false);
  const lastSubmittedCodeRef = useRef<string>("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");
    const queryFlow = searchParams.get("flow");
    const storedFlow = localStorage.getItem("verifyFlow");
    const resolvedFlow: VerifyFlow =
      queryFlow === "login" || storedFlow === "login" ? "login" : "register";

    if (!storedEmail) {
      const localePrefix = getLocalePrefix(pathname);
      router.push(
        `${localePrefix}/${resolvedFlow === "login" ? "login" : "register"}`,
      );
      return;
    }

    setEmail(storedEmail);
    setFlow(resolvedFlow);
  }, [pathname, router, searchParams]);

  const verifyCode = async (otpCode: string) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!otpCode || otpCode.length !== 6) {
      setError(t("invalidCode"));
      setIsLoading(false);
      return;
    }

    try {
      const response =
        flow === "login"
          ? await verifyLoginOtp({ email, code: otpCode })
          : await verifyRegisterOtp({ email, code: otpCode });

      let profileName = "";
      try {
        const profile = await getMe(response.accessToken);
        profileName = profile.name?.trim() ?? "";
      } catch {
        profileName = "";
      }

      // Always use the name from the database (profileName), fallback to "User"
      const resolvedName = profileName || "User";

      setSession({
        userId: response.userId,
        email: response.email,
        role: response.role,
        permissions: null,
        accessToken: response.accessToken,
        name: resolvedName,
      });

      setSuccess(t("verifiedRedirecting"));
      localStorage.removeItem("verifyEmail");
      localStorage.removeItem("verifyFlow");
      localStorage.removeItem("verifyName");

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
        if (response.role === "staff") {
          router.push(getFirstStaffAdminPath(localePrefix.slice(1), null));
          return;
        }
        router.push(`${localePrefix}/users`);
      }, 800);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t("verifyFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    await verifyCode(code);
  };

  useEffect(() => {
    if (!email || isLoading) return;

    if (code.length < 6) {
      lastSubmittedCodeRef.current = "";
      return;
    }

    if (code.length === 6 && lastSubmittedCodeRef.current !== code) {
      lastSubmittedCodeRef.current = code;
      void verifyCode(code);
    }
  }, [code, email, isLoading]);

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError(t("emailNotFound"));
      return;
    }

    try {
      if (flow === "login") {
        await login({ email });
        setSuccess(t("newOtpSent"));
      } else {
        setSuccess(t("useRegistrationOtp"));
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t("resendFailed"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t.rich("subtitle", {
                email: () => <span className="font-medium">{email}</span>,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel htmlFor="otp-verification">
                {t("verificationCode")}
              </FieldLabel>
              <InputOTP
                maxLength={6}
                id="otp-verification"
                value={code}
                disabled={isLoading}
                onChange={(value) =>
                  setCode(value.replace(/\D/g, "").slice(0, 6))
                }
                required
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-2" />
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                <button
                  type="button"
                  className="underline underline-offset-4 transition-colors hover:text-primary"
                  onClick={() => setIsResendOpen(true)}
                >
                  {t("resendPrompt")}
                </button>
              </FieldDescription>
            </Field>

            {error ? (
              <div className="mt-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
                {success}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </form>

      <Dialog open={isResendOpen} onOpenChange={setIsResendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("resend")}</DialogTitle>
            <DialogDescription>
              {t.rich("subtitle", {
                email: () => <span className="font-medium">{email}</span>,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResendOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await handleResend();
                setIsResendOpen(false);
              }}
            >
              <RefreshCwIcon />
              {t("resend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
