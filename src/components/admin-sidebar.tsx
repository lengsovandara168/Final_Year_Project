"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/use-logout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

export function SidebarUserNav({
  adminLabel,
  logoutLabel,
}: {
  adminLabel: string;
  logoutLabel: string;
}) {
  const handleLogout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="mt-auto p-2">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <img
                src="https://assets.aceternity.com/manu.png"
                className="h-8 w-8 shrink-0 rounded-lg"
                alt="Avatar"
              />
              <span className="truncate font-semibold">{adminLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="w-52 p-2"
          >
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 ${isLoggingOut ? "opacity-50 cursor-default" : ""}`}
              onClick={async (e) => {
                e.preventDefault();
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                try {
                  await handleLogout();
                } catch (error) {
                  console.error("Logout failed:", error);
                  setIsLoggingOut(false);
                }
              }}
              aria-disabled={isLoggingOut}
            >
              <LogOut className="size-4" />
              <span>{isLoggingOut ? `${logoutLabel}...` : logoutLabel}</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
