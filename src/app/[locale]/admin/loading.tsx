import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardsSkeleton } from "@/components/dashboard/stats-cards";
import { TopSellingProductsSkeleton } from "@/components/dashboard/TopSellingProducts";
import { RecentOrdersSkeleton } from "@/components/dashboard/RecentOrders";

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <StatsCardsSkeleton />

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        <TopSellingProductsSkeleton />
        <RecentOrdersSkeleton />
      </div>
    </div>
  );
}
