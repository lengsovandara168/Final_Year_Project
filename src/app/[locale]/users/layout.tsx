import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/ui/sonner";

type UsersLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UsersLayout({
  children,
  params,
}: UsersLayoutProps) {
  const { locale } = await params;
  const session = await getValidatedServerSession();
  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/users`);
  }

  if (session.user.role !== "user") {
    redirect(`/${locale}/admin`);
  }

  return (
    <CartProvider>
      {children}
      <Toaster position="top-right"/>
    </CartProvider>
  );
}
