import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { getFirstStaffAdminPath } from "@/lib/rbac";
import StaffAccountsPage from "./staff-accounts-page";

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getValidatedServerSession();

  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/admin/staff`);
  }

  if (session.user.role !== "admin") {
    redirect(getFirstStaffAdminPath(locale, session.user.permissions));
  }

  return <StaffAccountsPage locale={locale} />;
}
