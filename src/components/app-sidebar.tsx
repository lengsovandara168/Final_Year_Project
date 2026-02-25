"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto my-4 group-data-[collapsible=icon]:my-2">
            <Link
              href={`/${locale}/dashboard/admin`}
              className="flex items-center justify-center px-2 py-1 rounded-md transition-colors hover:bg-sidebar-accent"
            >
              {/* Logo for expanded state */}
              <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold">Logo </h1>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
