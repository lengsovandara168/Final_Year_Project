import DashboardLayout from "@/components/dashboard-layout";
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

  if (session.requiresRefresh) {
    redirect(`/api/auth/refresh-session?next=/${locale}/admin`);
  }

  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/users`);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
