"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
  ShieldCheck,
  ShoppingBag,
  Heart,
  User,
  Package,
} from "lucide-react";
import { categories } from "@/lib/shop-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  tablet: Tablet,
  headphones: Headphones,
  watch: Watch,
  shield: ShieldCheck,
};

const mainNavItems = [
  { title: "Home", icon: Home, href: "/" },
  { title: "All Products", icon: ShoppingBag, href: "/products" },
];

const accountNavItems = [
  { title: "My Orders", icon: Package, href: "/orders" },
  { title: "Wishlist", icon: Heart, href: "/wishlist" },
  { title: "Account", icon: User, href: "/account" },
];

export function ShopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto my-4 group-data-[collapsible=icon]:my-2">
            <Link
              href="/"
              className="flex items-center justify-center px-2 py-1 rounded-md transition-colors hover:bg-sidebar-accent"
            >
              {/* Logo for expanded state */}
              <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold">PhoneShop</h1>
              </div>
              {/* Logo for collapsed state */}
              <div className="hidden group-data-[collapsible=icon]:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white font-bold text-lg">
                  PS
                </div>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href && !currentCategory;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="default"
                      className="h-10"
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Smartphone;
                const isActive = currentCategory === category.slug;

                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={category.name}
                      size="default"
                      className="h-10"
                    >
                      <Link href={`/products?category=${category.slug}`}>
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                          {category.productCount}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
            My Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="default"
                      className="h-10"
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Admin Panel" className="h-10">
              <Link href="/admin" className="text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
