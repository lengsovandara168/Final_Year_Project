"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconMoneybagPlus, IconPackage, IconShoppingCart, IconUsers } from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DollarSign, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/use-logout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Image from "next/image";

export default function SidebarDemo({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const adminBasePath = `/${locale}/admin`;
  const handleLogout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const links = [
    ...(isAdmin
      ? [
          {
            label: t("dashboard"),
            href: adminBasePath,
            icon: (
              <LayoutDashboard className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
        ]
      : []),
    ...(isAdmin || isStaff
      ? [
          {
            label: t("products"),
            href: `${adminBasePath}/products`,
            icon: (
              <IconPackage className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: t("orders"),
            href: `${adminBasePath}/orders`,
            icon: (
              <IconShoppingCart className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
          {
            label: t("customers"),
            href: `${adminBasePath}/customers`,
            icon: (
              <IconUsers className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
          {
            label: t("sales"),
            href: `${adminBasePath}/sales`,
            icon: (
              <DollarSign className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
        ]
      : []),
  ];
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncSidebarState = (event: MediaQueryList | MediaQueryListEvent) => {
      setOpen(event.matches);
    };

    syncSidebarState(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebarState);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebarState);
    };
  }, []);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <div
        className={cn(
          "flex h-svh w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 lg:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        )}
      >
        <SidebarBody className="h-full justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="mt-auto pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md py-2 text-left hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                  aria-label={t("admin")}
                >
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                  <span
                    className={cn(
                      "text-sm text-neutral-700 dark:text-neutral-200",
                      open ? "inline-block" : "hidden",
                    )}
                  >
                    {t("admin")}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align={open ? "start" : "center"}
                className="w-52 p-2"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  onClick={async () => {
                    if (isLoggingOut) return;

                    setIsLoggingOut(true);
                    await handleLogout();
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="size-4" />
                  <span>
                    {isLoggingOut ? `${t("logout")}...` : t("logout")}
                  </span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </SidebarBody>
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto border border-neutral-200 bg-white lg:rounded-tl-2xl dark:border-neutral-700 dark:bg-neutral-900">
          {children}
        </div>
      </div>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <a href="#" className="relative z-20 flex items-center py-1">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Image
          src="/logo/logo.png"
          width={140}
          height={80}
          alt="Logo"
          className="h-20 w-auto object-contain"
          priority
        />
      </motion.div>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <Image
      src="/logo/logo.png"
      width={50}
      height={40}
      alt="Logo"
      className="size-10 object-contain"
      priority
    />
  );
};
