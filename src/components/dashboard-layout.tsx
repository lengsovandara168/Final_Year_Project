import LocaleSwitcher from "@/components/lang/locale-switcher";
import { getTranslations } from "next-intl/server";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";
import Link from "next/link";
import {
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ShieldCheck,
} from "lucide-react";
import { SidebarUserNav } from "./admin-sidebar";
import Image from "next/image";
import { getValidatedServerSession } from "@/lib/auth-server";
import { hasPermission } from "@/lib/rbac";

export default async function DashboardLayout({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Common" });
  const tSidebar = await getTranslations({ locale, namespace: "Sidebar" });

  // Fetch session to determine role and permissions
  const session = await getValidatedServerSession();
  const user = session?.user;
  const role = user?.role || "staff";
  const permissions = user?.permissions;

  const adminBasePath = `/${locale}/admin`;

  const navItems = [];

  // Dashboard is visible to admin, and staff only when explicitly allowed
  if (hasPermission(role, permissions, "canViewDashboard")) {
    navItems.push({
      title: tSidebar("dashboard"),
      url: adminBasePath,
      icon: LayoutDashboard,
    });
  }

  // Permissions check for products
  if (hasPermission(role, permissions, "canCheckIn")) {
    navItems.push({
      title: tSidebar("products"),
      url: `${adminBasePath}/products`,
      icon: Package,
    });
  }

  // Permissions check for orders
  if (hasPermission(role, permissions, "canViewOrders")) {
    navItems.push({
      title: tSidebar("orders"),
      url: `${adminBasePath}/orders`,
      icon: ShoppingCart,
    });
  }

  // Permissions check for customers
  if (hasPermission(role, permissions, "canViewCustomers")) {
    navItems.push({
      title: tSidebar("customers"),
      url: `${adminBasePath}/customers`,
      icon: Users,
    });
  }

  // Permissions check for sales (sell function/check-in)
  if (
    hasPermission(role, permissions, "canSell") ||
    hasPermission(role, permissions, "canCheckIn")
  ) {
    navItems.push({
      title: tSidebar("sales"),
      url: `${adminBasePath}/sales`,
      icon: DollarSign,
    });
  }

  // Admin-only Staff Settings
  if (role === "admin") {
    navItems.push({
      title: tSidebar("staffAccess"),
      url: `${adminBasePath}/staff`,
      icon: ShieldCheck,
    });
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex h-16 items-center justify-center ">
          <Image
            src="/logo/logo.png"
            width={140}
            height={80}
            alt="Logo"
            className="h-10 w-auto object-contain"
            priority
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("adminPanel")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserNav
            adminLabel={tSidebar("admin")}
            logoutLabel={tSidebar("logout")}
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] duration-100 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger />
          <div className="flex w-full items-center justify-between">
            <div className="px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {t("adminPanel")}
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
