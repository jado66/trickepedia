"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";

export interface UserGrowthPoint {
  date: string;
  daily: number;
  cumulative: number;
}

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
  isLoading?: boolean;
  className?: string;
  lineColor?: string;
  areaOpacity?: number;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  isLoading,
  className,
  lineColor,
  areaOpacity = 0.25,
}) => {
  const effectiveLineColor = lineColor || "#16a34a";
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Find the earliest date (launch date)
    const launchDate = new Date(data[0].date);

    // Transform data to show days since launch
    return data.map((point) => {
      const currentDate = new Date(point.date);
      const daysSinceLaunch = Math.floor(
        (currentDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...point,
        daysSinceLaunch,
      };
    });
  }, [data]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[240px] w-full animate-pulse rounded-md bg-muted" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No user data yet.</p>
        ) : (
          <ChartContainer className="p-0 border-none shadow-none bg-transparent">
            <ChartHeader description="Cumulative users by days since launch" />
            <div className="h-[240px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="daysSinceLaunch"
                    tick={{ fontSize: 11 }}
                    tickMargin={8}
                    minTickGap={32}
                    label={{
                      value: "Days Since Launch",
                      position: "insideBottom",
                      offset: -5,
                      style: { fontSize: 11 },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    width={40}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelFormatter={(label) => `Day ${label}`}
                    formatter={(value: any, name) => {
                      if (name === "cumulative") return [value, "Total Users"];
                      if (name === "daily") return [value, "New Users"];
                      return [value, name];
                    }}
                  />
                  {areaOpacity > 0 && (
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="none"
                      fill={effectiveLineColor}
                      fillOpacity={areaOpacity}
                      isAnimationActive={false}
                      hide={true}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke={effectiveLineColor}
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
