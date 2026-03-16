"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProductTypeAnalyticsItem } from "@/lib/api/dashboard";
import { useTranslations } from "next-intl";

interface ProductTypeAnalysisChartProps {
  items: ProductTypeAnalyticsItem[];
}

type ProductTypeMetric = "stock" | "value";

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductTypeAnalysisChart({ items }: ProductTypeAnalysisChartProps) {
  const t = useTranslations("Dashboard");
  const [metric, setMetric] = useState<ProductTypeMetric>("stock");

  const chartConfig = {
    inStock: {
      label: t("analytics.productTypes.inStock"),
      color: "var(--chart-1)",
    },
    outOfStock: {
      label: t("analytics.productTypes.outOfStock"),
      color: "var(--chart-2)",
    },
    inStockValue: {
      label: t("analytics.productTypes.inStock"),
      color: "var(--chart-1)",
    },
    outOfStockValue: {
      label: t("analytics.productTypes.outOfStock"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const chartData = items.map((item) => ({
    type: item.label,
    inStock: item.inStock,
    outOfStock: item.outOfStock,
    inStockValue: item.inStockValue,
    outOfStockValue: item.outOfStockValue,
  }));

  const keys = useMemo(
    () =>
      metric === "value"
        ? {
            inStock: "inStockValue" as const,
            outOfStock: "outOfStockValue" as const,
          }
        : {
            inStock: "inStock" as const,
            outOfStock: "outOfStock" as const,
          },
    [metric],
  );

  const totalInStock = items.reduce((sum, item) => sum + item.inStock, 0);
  const totalOutOfStock = items.reduce((sum, item) => sum + item.outOfStock, 0);
  const total = totalInStock + totalOutOfStock;
  const inStockRate = total > 0 ? (totalInStock / total) * 100 : 0;
  const totalInStockValue = items.reduce((sum, item) => sum + item.inStockValue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("analytics.productTypes.title")}</CardTitle>
            <CardDescription>{t("analytics.productTypes.subtitle")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={metric === "stock" ? "default" : "outline"}
              onClick={() => setMetric("stock")}
            >
              {t("analytics.productTypes.viewStock")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={metric === "value" ? "default" : "outline"}
              onClick={() => setMetric("value")}
            >
              {t("analytics.productTypes.viewValue")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value) =>
                    metric === "value"
                      ? formatCurrency(Number(value))
                      : String(value)
                  }
                />
              }
            />
            <Bar dataKey={keys.inStock} fill={`var(--color-${keys.inStock})`} radius={4} />
            <Bar dataKey={keys.outOfStock} fill={`var(--color-${keys.outOfStock})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {metric === "value"
            ? t("analytics.productTypes.valueTrend", {
                value: formatCurrency(totalInStockValue),
              })
            : t("analytics.productTypes.trend", { value: inStockRate.toFixed(1) })}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t("analytics.productTypes.help")}
        </div>
      </CardFooter>
    </Card>
  );
}
