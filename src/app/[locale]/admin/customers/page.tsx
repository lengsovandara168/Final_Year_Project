import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, AlertCircle } from "lucide-react";
import { getCustomers, type Customer } from "@/lib/api/customers";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}

function ErrorAlert({ title, description }: { title: string; description: string }) {
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

function CustomersTable({ data, t }: { data: Customer[]; t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("phone")}</TableHead>
            <TableHead>{t("totalOrders")}</TableHead>
            <TableHead>{t("totalSpent")}</TableHead>
            <TableHead>{t("joinedDate")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-black text-white text-xs">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{customer.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{customer.email}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell className="text-center">{customer.totalOrders}</TableCell>
              <TableCell className="font-medium">
                ${typeof customer.totalSpent === "number" ? customer.totalSpent.toFixed(2) : customer.totalSpent}
              </TableCell>
              <TableCell className="text-gray-600">{customer.joinedDate}</TableCell>
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

export default async function CustomersPage() {
  const t = await getTranslations("AdminCustomers");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  let customers: Customer[] = [];
  let hasError = false;

  if (accessToken) {
    try {
      const response = await getCustomers(accessToken);
      customers = response.data;
    } catch (err) {
      console.error("Failed to fetch customers:", err);
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
            <CardTitle>{t("allCustomers", { count: customers.length })}</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder={t("searchPlaceholder")} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState title={t("emptyTitle")} subtitle={t("emptySubtitle")} />
          ) : (
            <CustomersTable data={customers} t={t} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
