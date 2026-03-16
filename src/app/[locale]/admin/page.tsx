import { getTranslations } from "next-intl/server";
import { getDashboardData } from "@/lib/api";
import { cookies } from "next/headers";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopSellingProducts } from "@/components/dashboard/TopSellingProducts";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  let data;
  let error: string | null = null;

  if (!accessToken) {
    error = t("noAccessToken");
  } else {
    try {
      data = await getDashboardData(accessToken);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      error =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : t("failedLoad");
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-gray-500 md:text-base">{t("welcome")}</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {t("realTimeData")}
        </Badge>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{t("errorLoading")}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <StatsCards locale={locale} stats={data?.stats} />

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        <TopSellingProducts locale={locale} products={data?.topSellingProducts} />
        <RecentOrders locale={locale} orders={data?.recentOrders} />
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{t("noteLabel")}</span> {t("noteMessage")}
        </p>
      </div>
    </div>
  );
}
