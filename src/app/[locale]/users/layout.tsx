import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { Toaster } from "@/components/ui/sonner";
import UsersLayoutHeader from "@/components/shop/users-layout";
import UsersSidebar from "@/components/shop/users-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getFirstStaffAdminPath } from "@/lib/rbac";

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
    if (session.user.role === "staff") {
      redirect(getFirstStaffAdminPath(locale, session.user.permissions));
    }
    redirect(`/${locale}/admin`);
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <SidebarProvider>
          <UsersSidebar />
          <SidebarInset>
            <UsersLayoutHeader />
            <Toaster position="top-center" />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
