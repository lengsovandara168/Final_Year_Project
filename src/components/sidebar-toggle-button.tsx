"use client";

import { PanelRightOpen } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function SidebarToggleButton() {
  const { open, setOpen } = useSidebar();

  return (
    <Button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      aria-label="Toggle sidebar"
      className="hidden lg:inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      <PanelRightOpen
        className={cn("size-4 transition-transform", open && "rotate-180")}
      />
    </Button>
  );
}
