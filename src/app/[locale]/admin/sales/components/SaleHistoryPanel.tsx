import { useQuery } from "@tanstack/react-query";
import { Eye, LoaderCircle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getSessionSnapshot } from "@/lib/auth-session";
import { getPosReceipts, type PosReceiptSummary } from "@/lib/api/pos";

export function SalesHistoryPanel() {
  // Fetch POS receipts using React Query
  const {
    data: receipts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pos-receipts-history"],
    queryFn: async () => {
      const { accessToken } = getSessionSnapshot();
      if (!accessToken) throw new Error("Not authenticated");

      const response = await getPosReceipts(accessToken);
      return Array.isArray(response.data) ? response.data : [];
    },
    // Don't keep retrying if the server is throwing a 500 error
    retry: false,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-emerald-100 text-emerald-800",
      completed: "bg-black text-white",
      processing: "bg-gray-800 text-white",
      pending: "bg-amber-100 text-amber-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-200";
  };

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <CardTitle>In-Store Sales History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 flex justify-center items-center text-muted-foreground">
            <LoaderCircle className="h-6 w-6 animate-spin mr-2" />
            Loading sales history...
          </div>
        ) : isError ? (
          <div className="py-12 flex flex-col justify-center items-center text-destructive text-center">
            <AlertCircle className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-lg font-medium">Failed to load receipts</p>
            <p className="text-sm opacity-80 mt-1 max-w-100">
              {error instanceof Error
                ? error.message
                : "The server encountered an error (500). Please check your backend logs."}
            </p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No history found</p>
            <p className="text-sm">There are no recent POS transactions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Receipt ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt: PosReceiptSummary, index: number) => (
                  <TableRow key={receipt.id || receipt.orderNumber || index}>
                    <TableCell className="font-medium text-xs font-mono">
                      {receipt.orderNumber || receipt.id}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {receipt.customerName || "Walk-in Customer"}
                      </p>
                      {receipt.customerEmail && (
                        <p className="text-xs text-muted-foreground">
                          {receipt.customerEmail}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{receipt.itemsCount || "-"}</TableCell>
                    <TableCell className="font-medium">
                      $
                      {typeof receipt.total === "number"
                        ? receipt.total.toFixed(2)
                        : receipt.total}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(receipt.status)}>
                        {receipt.status.charAt(0).toUpperCase() +
                          receipt.status.slice(1)}
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
        )}
      </CardContent>
    </Card>
  );
}
