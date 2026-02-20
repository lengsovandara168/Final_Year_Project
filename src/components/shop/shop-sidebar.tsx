"use client";

import { useMemo } from "react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronRight,
} from "lucide-react";
import { categories, getBrandsWithCountsByCategory } from "@/lib/shop-data";
import Image from "next/image";

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
  const currentBrand = searchParams.get("brand");

  // Get brands for each category
  const categoryBrands = useMemo(() => {
    const brandsMap: Record<string, { brand: string; slug: string; logo: string; count: number }[]> = {};
    categories.forEach((cat) => {
      brandsMap[cat.slug] = getBrandsWithCountsByCategory(cat.slug);
    });
    return brandsMap;
  }, []);

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

        {/* Categories with Brands */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold">
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Smartphone;
                const isActive = currentCategory === category.slug;
                const brands = categoryBrands[category.slug] || [];
                const hasBrands = brands.length > 0;

                if (!hasBrands) {
                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive && !currentBrand}
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
                }

                return (
                  <Collapsible
                    key={category.id}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isActive && !currentBrand}
                          tooltip={category.name}
                          size="default"
                          className="h-10"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{category.name}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {/* All in category */}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive && !currentBrand}
                            >
                              <Link href={`/products?category=${category.slug}`}>
                                <span>All {category.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {category.productCount}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {/* Brands */}
                          {brands.map(({ brand, slug, logo, count }) => (
                            <SidebarMenuSubItem key={brand}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive && currentBrand === brand}
                              >
                                <Link href={`/products?category=${category.slug}&brand=${brand}`}>
                                  {/* Brand Logo - Add your logos in /public/brands/ folder */}
                                  <span className="relative h-4 w-4 mr-1 flex-shrink-0 overflow-hidden rounded-sm">
                                    <Image
                                      src={logo}
                                      alt={`${brand} logo`}
                                      width={16}
                                      height={16}
                                      className="object-contain"
                                      onError={(e) => {
                                        // Fallback to first letter if logo fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <span className="hidden absolute inset-0 flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-600 rounded-sm">
                                      {brand.charAt(0)}
                                    </span>
                                  </span>
                                  <span>{brand}</span>
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {count}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
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
