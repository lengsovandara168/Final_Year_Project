import LocaleSwitcher from "@/components/lang/locale-switcher";
import SidebarDemo from "./sidebar-demo";
import SidebarToggleButton from "./sidebar-toggle-button";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <SidebarDemo>
      <div className="flex h-full flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="ml-4 flex items-center gap-2">
            <SidebarToggleButton />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {t("adminPanel")}
            </div>
            <div className="mr-4 flex items-center gap-2">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </SidebarDemo>
  );
}
