import { getValidatedServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function StaffAccessPage({
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
    redirect(`/${locale}/admin`);
  }

  redirect(`/${locale}/admin/role_access`);
}
