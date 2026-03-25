"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-border/70 !bg-background !text-foreground !shadow-lg",
          title: "!font-medium",
          description: "!text-muted-foreground",
          success:
            "!border-emerald-200 !bg-emerald-50 !text-emerald-950 dark:!border-emerald-900 dark:!bg-emerald-950/40 dark:!text-emerald-100",
          info: "!border-sky-200 !bg-sky-50 !text-sky-950 dark:!border-sky-900 dark:!bg-sky-950/40 dark:!text-sky-100",
          warning:
            "!border-amber-200 !bg-amber-50 !text-amber-950 dark:!border-amber-900 dark:!bg-amber-950/40 dark:!text-amber-100",
          error:
            "!border-red-200 !bg-red-50 !text-red-950 dark:!border-red-900 dark:!bg-red-950/40 dark:!text-red-100",
          actionButton: "!bg-foreground !text-background",
          cancelButton: "!bg-muted !text-foreground",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
