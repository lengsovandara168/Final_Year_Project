import DashboardLayout from "@/components/dashboard-layout";
import { Toaster } from "@/components/ui/sonner";

import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const session = await getValidatedServerSession();
  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    redirect(`/${locale}/login`);
  }

  return (
    <DashboardLayout locale={locale}>
      {children}
      <Toaster position="top-right" />
    </DashboardLayout>
  );
}
