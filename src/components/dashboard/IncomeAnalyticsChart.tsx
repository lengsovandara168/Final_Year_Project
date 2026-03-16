"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { IncomeAnalytics } from "@/lib/api/dashboard";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

interface IncomeAnalyticsChartProps {
  locale: string;
  incomeAnalytics: IncomeAnalytics;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  revenueYearly: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function IncomeAnalyticsChart({
  locale,
  incomeAnalytics,
}: IncomeAnalyticsChartProps) {
  const t = useTranslations("Dashboard");

  const monthlyData = useMemo(() => {
    return incomeAnalytics.monthly.map((item) => {
      const [year, month] = item.period.split("-").map(Number);
      const label = new Intl.DateTimeFormat(locale, {
        month: "short",
      }).format(new Date(year, (month || 1) - 1, 1));

      return {
        ...item,
        label,
      };
    });
  }, [incomeAnalytics.monthly, locale]);

  const yearlyData = useMemo(() => {
    return incomeAnalytics.yearly.map((item) => ({
      ...item,
      label: item.period,
    }));
  }, [incomeAnalytics.yearly]);

  const latestMonthRevenue = incomeAnalytics.monthly.at(-1)?.revenue ?? 0;
  const currentYearRevenue = incomeAnalytics.yearly.at(-1)?.revenue ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{t("analytics.income.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("analytics.income.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-muted-foreground">
                {t("analytics.income.latestMonth")}
              </p>
              <p className="font-semibold">
                {formatCurrency(latestMonthRevenue)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-muted-foreground">
                {t("analytics.income.currentYear")}
              </p>
              <p className="font-semibold">
                {formatCurrency(currentYearRevenue)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList>
            <TabsTrigger value="monthly">
              {t("analytics.income.monthly")}
            </TabsTrigger>
            <TabsTrigger value="yearly">
              {t("analytics.income.yearly")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-4">
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart
                data={monthlyData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    `$${Number(value).toLocaleString()}`
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="yearly" className="mt-4">
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <LineChart
                data={yearlyData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    `$${Number(value).toLocaleString()}`
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenueYearly)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
