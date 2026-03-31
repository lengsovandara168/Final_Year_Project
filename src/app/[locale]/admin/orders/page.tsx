import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Eye, AlertCircle } from "lucide-react";
import { getOrders, type Order } from "@/lib/api/orders";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getOrderDisplayId } from "@/lib/order-display";

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: "bg-black text-white",
    processing: "bg-gray-800 text-white",
    pending: "bg-gray-400 text-white",
  };
  return colors[status.toLowerCase()] || "bg-gray-200";
}

function getSourceBadge(source: string) {
  return source?.toLowerCase() === "pos"
    ? "bg-blue-100 text-blue-800"
    : "bg-green-100 text-green-800";
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}

function ErrorAlert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-blue-900">{title}</p>
        <p className="text-sm text-blue-700 mt-1">{description}</p>
      </div>
    </div>
  );
}

function OrdersTable({
  data,
  t,
}: {
  data: Order[];
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const statusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "pending") return t("pending");
    if (normalized === "processing") return t("processing");
    if (normalized === "completed") return t("completed");
    return status;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("orderId")}</TableHead>
            <TableHead>{t("customer")}</TableHead>
            <TableHead>{t("items")}</TableHead>
            <TableHead>{t("total")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("source")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {getOrderDisplayId(order) || "-"}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-sm text-gray-500">{order.email}</p>
                </div>
              </TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell className="font-medium">
                $
                {typeof order.total === "number"
                  ? order.total.toFixed(2)
                  : order.total}
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {statusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getSourceBadge(order.source || "")}
                >
                  {order.source || t("online")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function OrdersPage() {
  const t = await getTranslations("AdminOrders");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  let orders: Order[] = [];
  let hasError = false;

  if (accessToken) {
    try {
      const response = await getOrders(accessToken);
      orders = response.data;
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Unknown error";
      console.error("Failed to fetch orders:", message);
      hasError = true;
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-gray-500 md:text-base">{t("subtitle")}</p>
      </div>

      {hasError && (
        <ErrorAlert
          title={t("endpointSoonTitle")}
          description={t("endpointSoonDesc")}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              {t("allOrders", {
                count: orders.length > 0 ? `(${orders.length})` : "",
              })}
            </CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {t("filterStatus")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t("all")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("pending")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("processing")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("completed")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder={t("searchPlaceholder")} className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState title={t("emptyTitle")} subtitle={t("emptySubtitle")} />
          ) : (
            <OrdersTable data={orders} t={t} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
