"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, cfg]) => Boolean(cfg?.color));

  if (entries.length === 0) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${entries
          .map(([key, cfg]) => `  --color-${key}: ${cfg.color};`)
          .join("\n")}\n}`,
      }}
    />
  );
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(function ChartContainer({ id, className, children, config, ...props }, ref) {
  const chartId = React.useId().replace(/:/g, "");
  const resolvedId = `chart-${id ?? chartId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={resolvedId}
        className={cn(
          "flex aspect-video w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={resolvedId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children as React.ComponentProps<
            typeof RechartsPrimitive.ResponsiveContainer
          >["children"]}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

export const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

interface ChartTooltipContentProps
  extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  nameKey?: string;
  labelFormatter?: (
    value: string | number,
    payload?: TooltipPayloadItem[],
  ) => React.ReactNode;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipPayloadItem,
    index: number,
    payload: TooltipPayloadItem[],
  ) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  nameKey,
  labelFormatter,
  formatter,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const resolvedLabel =
    typeof labelFormatter === "function"
      ? labelFormatter(label ?? "", payload)
      : label;

  return (
    <div
      className={cn(
        "min-w-32 rounded-lg border bg-background px-3 py-2 text-xs shadow-md",
        className,
      )}
    >
      {!hideLabel && resolvedLabel ? (
        <div className="mb-1.5 font-medium">{resolvedLabel}</div>
      ) : null}

      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const configKey = String(item.dataKey ?? item.name ?? "");
          const itemConfig = config[configKey];
          const labelText =
            (nameKey &&
              item.payload &&
              typeof item.payload[nameKey] === "string" &&
              item.payload[nameKey]) ||
            itemConfig?.label ||
            item.name ||
            key;

          const color = item.color || itemConfig?.color || "var(--muted-foreground)";
          const rawValue = item.value ?? "";

          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                {!hideIndicator ? (
                  indicator === "line" || indicator === "dashed" ? (
                    <span
                      className={cn(
                        "h-0 w-3 border-t",
                        indicator === "dashed" && "border-dashed",
                      )}
                      style={{ borderColor: color }}
                    />
                  ) : (
                    <span
                      className="h-2 w-2 rounded-[2px]"
                      style={{ backgroundColor: color }}
                    />
                  )
                ) : null}
                <span>{labelText}</span>
              </div>

              <span className="font-medium text-foreground">
                {formatter
                  ? formatter(rawValue, String(labelText), item, index, payload)
                  : rawValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
