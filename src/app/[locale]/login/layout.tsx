import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";

export default async function LoginLayout({
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
    if (session.user.role === "user") {
      redirect(`/${locale}/users`);
    }
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
