import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  ClipboardList,
  Package,
  PackagePlus,
  Users,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

interface QuickActionsCardProps {
  locale: string;
}

export async function QuickActionsCard({ locale }: QuickActionsCardProps) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const base = `/${locale}/admin`;

  const actions = [
    {
      label: t("analytics.manageSales"),
      icon: BarChart3,
      href: `${base}/sales`,
      style:
        "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100",
    },
    {
      label: t("analytics.addProduct"),
      icon: PackagePlus,
      href: `${base}/products/add-stock`,
      style: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100",
    },
    {
      label: t("analytics.buildTemplate"),
      icon: Wrench,
      href: `${base}/products/templates`,
      style:
        "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100",
    },
    {
      label: t("analytics.viewOrders"),
      icon: ClipboardList,
      href: `${base}/orders`,
      style:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100",
    },
    {
      label: t("analytics.viewCustomers"),
      icon: Users,
      href: `${base}/customers`,
      style:
        "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100",
    },
    {
      label: t("analytics.manageProducts"),
      icon: Package,
      href: `${base}/products`,
      style: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("analytics.quickActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center text-sm font-medium transition-colors ${action.style}`}
              >
                <Icon className="h-6 w-6" />
                <span className="leading-tight">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
