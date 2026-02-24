import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getValidatedServerSession();

  if (session.requiresRefresh) {
    redirect(`/api/auth/refresh-session?next=/${locale}`);
  }

  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role === "admin") {
    redirect(`/${locale}/dashboard/admin`);
  }

  if (session.user.role === "user") {
    redirect(`/${locale}/users`);
  }

  redirect(`/${locale}/login`);
}
