import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LocaleSwitcher from "@/components/lang/locale-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger />
            </div>
            <div className="mr-4">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
