"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Heart,
  LogOut,
  ReceiptText,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import Image from "next/image";

import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { Link } from "@/i18n/routing";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type UsersNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export default function UsersSidebar() {
  const t = useTranslations("Shop");
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const handleLogout = useLogout();

  if (!isMobile) {
    return null;
  }

  const navItems: UsersNavItem[] = [
    { label: "Shop", href: "/users", icon: Store },
    { label: "Cart", href: "/users/cart", icon: ShoppingCart },
    { label: "Wishlist", href: "/users/wishlist", icon: Heart },
    { label: "Profile", href: "/users/profile", icon: User },
    { label: "Purchase", href: "/users/purchase", icon: ReceiptText },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/users">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-black text-white">
                  <Image
                    src="/logo/logo.png"
                    alt="Astrix logo"
                    width={40}
                    height={40}
                    className="size-full object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Astrix</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("brand")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("categories")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.endsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2">
          <Separator className="mb-3" />
          <div className="mb-2 text-xs text-muted-foreground">
            {(user?.name ?? "").trim() || t("brand")}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            <span>{t("logout")}</span>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
