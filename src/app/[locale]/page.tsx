import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { getFirstStaffAdminPath } from "@/lib/rbac";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getValidatedServerSession();
  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  if (session.user.role === "staff") {
    redirect(getFirstStaffAdminPath(locale, session.user.permissions));
  }

  if (session.user.role === "user") {
    redirect(`/${locale}/users`);
  }

  redirect(`/${locale}/login`);
}
