import { AuthProvider } from "@/contexts/auth-context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { getFirstStaffAdminPath } from "@/lib/rbac";

export default async function VerifyOtpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getValidatedServerSession();
  if (session.isAuthenticated && session.user) {
    if (session.user.role === "admin") {
      redirect(`/${locale}/admin`);
    }
    if (session.user.role === "staff") {
      redirect(getFirstStaffAdminPath(locale, session.user.permissions));
    }
    if (session.user.role === "user") {
      redirect(`/${locale}/users`);
    }
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  );
}
