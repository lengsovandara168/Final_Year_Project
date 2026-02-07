"use client";

import { Bell, Search, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 md:px-6 gap-4 shadow-sm transition-all duration-200">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="-ml-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 active:scale-95" />
      
      {/* Search Bar - Hidden on mobile */}
      <div className="hidden md:flex flex-1 items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            className={cn(
              "pl-9 h-9 text-sm w-full font-medium",
              "bg-slate-100 dark:bg-slate-900 border-0 rounded-lg",
              "placeholder:text-slate-500 dark:placeholder:text-slate-400",
              "focus-visible:bg-white dark:focus-visible:bg-slate-800",
              "focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-500",
              "transition-all duration-150 ease-out"
            )}
          />
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-1 lg:gap-3 ml-auto">
        {/* Search button for mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 active:scale-95"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 active:scale-95 relative group"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5 group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        </Button>
        
        {/* User Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 active:scale-95"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                <AvatarImage src="/avatar.png" alt="Admin" />
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal py-3 px-2">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                  admin@phoneshop.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuItem className={cn(
              "cursor-pointer text-slate-700 dark:text-slate-300 text-sm font-medium",
              "focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors duration-150",
              "py-2 px-2"
            )}>
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={cn(
              "cursor-pointer text-slate-700 dark:text-slate-300 text-sm font-medium",
              "focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors duration-150",
              "py-2 px-2"
            )}>
              <SettingsIcon className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuItem className={cn(
              "cursor-pointer text-red-600 dark:text-red-400 text-sm font-medium",
              "focus:bg-red-100 dark:focus:bg-red-500/10 transition-colors duration-150",
              "py-2 px-2"
            )}>
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
