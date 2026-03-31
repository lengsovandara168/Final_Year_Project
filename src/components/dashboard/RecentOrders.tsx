import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { RecentOrder } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";

interface RecentOrdersProps {
  locale: string;
  orders?: RecentOrder[];
}

const STATUS_CLASSES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
};

export async function RecentOrders({ locale, orders }: RecentOrdersProps) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const knownStatus: Record<string, string> = {
    completed: t("status.completed"),
    processing: t("status.processing"),
    pending: t("status.pending"),
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("recentOrders")}</CardTitle>
          <Link
            href={`/${locale}/admin/orders`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("analytics.viewOrders")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {!orders || orders.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("analytics.noOrders")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("analytics.orderId")}</TableHead>
                  <TableHead>{t("analytics.customer")}</TableHead>
                  <TableHead className="text-right">
                    {t("analytics.total")}
                  </TableHead>
                  <TableHead>
                    {t("status.completed").replace("Completed", "") ||
                      t("analytics.orderStatus")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusClass =
                    STATUS_CLASSES[order.status?.toLowerCase()] ??
                    "bg-gray-100 text-gray-700";
                  const statusLabel =
                    knownStatus[order.status?.toLowerCase()] ?? order.status;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.displayId || "-"}
                      </TableCell>
                      <TableCell className="max-w-30 truncate">
                        <div>
                          <p className="truncate font-medium text-sm">
                            {order.customer}
                          </p>
                          {order.date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        $
                        {order.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusClass}>{statusLabel}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-35" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-3 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
