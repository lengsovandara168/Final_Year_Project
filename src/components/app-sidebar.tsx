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

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto my-4 group-data-[collapsible=icon]:my-2">
            <Link
              href="/admin"
              className="flex items-center justify-center px-2 py-1 rounded-md transition-colors hover:bg-sidebar-accent"
            >
              {/* Logo for expanded state */}
              <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold">PhoneShop POS</h1>
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
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
