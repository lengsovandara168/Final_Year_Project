import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import LocaleSwitcher from "@/components/lang/locale-switcher";
import { getTranslations } from "next-intl/server";
import { getValidatedServerSession } from "@/lib/auth-server";
import { AppSidebar } from "./app-sidebar";

export default async function DashboardLayout({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Common" });
  const session = await getValidatedServerSession();
  const user = session?.user;
  const role = user?.role;

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {t("adminPanel")}
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50/50 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
