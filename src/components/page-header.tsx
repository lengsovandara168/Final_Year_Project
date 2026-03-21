"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  containerClassName,
  children,
}: PageHeaderProps) {
  if (children) {
    return (
      <header className={cn("border-b bg-white", className)}>
        <div
          className={cn(
            "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
            containerClassName,
          )}
        >
          {children}
        </div>
      </header>
    );
  }

  return (
    <div className={cn("border-b bg-white px-8 py-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title ?? ""}</h1>
          <p className="text-gray-500">{description ?? ""}</p>
        </div>
        <div className="flex items-center gap-4">
          {action}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-black text-white">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
