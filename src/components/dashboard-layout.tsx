import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import LocaleSwitcher from "@/components/lang/locale-switcher";
import { getTranslations } from "next-intl/server";
import { getValidatedServerSession } from "@/lib/auth-server";

export default async function DashboardLayout({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Common" });
  const session = await getValidatedServerSession();
  const role = session?.user?.role;

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              {t("adminPanel")}
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto bg-sidebar/50 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
