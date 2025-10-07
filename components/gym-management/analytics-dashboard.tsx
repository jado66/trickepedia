"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Sparkles,
} from "lucide-react";
import { useGymAnalytics } from "@/contexts/gym/gym-analytics";
import { useGym } from "@/contexts/gym/gym-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export function AnalyticsDashboard() {
  const {
    loading: dataLoading,
    memberGrowthPct,
    classAttendancePct,
    revenueGrowthPct,
    retentionPct,
    popularClasses,
    revenueHistory,
  } = useGymAnalytics();
  const { demoMode } = useGym();

  // Member analytics (computed locally from members in gym store)
  const { members } = useGym();
  const [memberView, setMemberView] = useState<"active" | "total" | "combined">(
    "active"
  );

  // Consider a member "active" for a historical month if they visited within the
  // past N days relative to that month end. This provides a truer historical trend
  // than using their CURRENT status for every prior month (which caused the flat line).
  const ACTIVE_RECENCY_DAYS = 45; // tweak as needed (30, 45, 60)

  // Build monthly buckets (YYYY-MM) from earliest join date to current month
  const memberSeries = useMemo(() => {
    if (!members || members.length === 0)
      return [] as { month: string; total: number; active: number }[];
    // Normalize & pre-parse member date fields once for efficiency & robustness
    const normalized = members
      .filter((m: any) => !!m.joinDate)
      .map((m: any) => {
        const join = new Date(m.joinDate);
        const lastVisit = m.lastVisit ? new Date(m.lastVisit) : null;
        return {
          ...m,
          _join: isNaN(join.getTime()) ? null : join,
          _lastVisit:
            lastVisit && !isNaN(lastVisit.getTime()) ? lastVisit : null,
        };
      })
      .filter((m: any) => m._join);
    if (!normalized.length) return [];

    const earliest = new Date(
      Math.min(...normalized.map((m: any) => m._join.getTime()))
    );
    earliest.setDate(1); // align to month start
    const now = new Date();
    const cursor = new Date(earliest);
    const byMonth: { month: string; total: number; active: number }[] = [];
    while (cursor <= now) {
      const monthKey = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthEnd = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      const windowStart = new Date(monthEnd);
      windowStart.setDate(windowStart.getDate() - ACTIVE_RECENCY_DAYS);

      // Members who have joined on or before the month end
      const cumulative = normalized.filter((m: any) => m._join! <= monthEnd);
      // Active definition: lastVisit in recency window OR (fallback) status === active when no lastVisit data
      const active = cumulative.filter((m: any) => {
        if (m._lastVisit) {
          return m._lastVisit >= windowStart && m._lastVisit <= monthEnd;
        }
        return m.status === "active";
      });
      byMonth.push({
        month: monthKey,
        total: cumulative.length,
        active: active.length,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return byMonth.slice(-12); // keep last 12 months
  }, [members, ACTIVE_RECENCY_DAYS]);

  const memberDisplaySeries = useMemo(() => {
    if (!memberSeries.length) return [] as { month: string; value: number }[];
    return memberSeries.map((pt) => ({
      month: pt.month,
      value: memberView === "active" ? pt.active : pt.total,
    }));
  }, [memberSeries, memberView]);

  // Revenue series transform (keep original order, add short label)
  const revenueSeries = useMemo(
    () =>
      revenueHistory.map((r) => ({
        ...r,
        short: r.month.slice(5),
      })),
    [revenueHistory]
  );

  // Popular classes transform for chart (limit top 8)
  const popularClassSeries = useMemo(
    () =>
      popularClasses.slice(0, 8).map((c) => ({
        name: c.name,
        attendance: c.attendancePct,
        capacityFill: c.attendancePct,
        enrolled: c.enrolled,
        capacity: c.capacity,
      })),
    [popularClasses]
  );

  const activeVsTotalCombined = useMemo(
    () =>
      memberSeries.map((m) => ({
        month: m.month,
        Active: m.active,
        Total: m.total,
      })),
    [memberSeries]
  );

  // THEME COLORS with robust fallbacks so Recharts doesn't default to black when vars undefined.
  // Prefer dedicated chart palette tokens if you later define them (e.g. --chart-1..n)
  const palette = {
    primary: "hsl(var(--primary, 221 83% 53%))", // Indigo fallback
    accent: "hsl(var(--secondary, 142 72% 29%))", // Green fallback
    revenue: "hsl(var(--chart-3, 27 96% 61%))", // Orange fallback
    classes: "hsl(var(--chart-4, 291 70% 50%))", // Purple fallback
    neutralGrid: "hsl(var(--muted-foreground, 215 16% 47%) / 0.2)",
  } as const;
  // Specific semantic mappings per chart (keeps flexibility if design system expands)
  const colorPrimary = palette.primary;
  const colorAccent = palette.accent;
  const colorRevenue = palette.revenue;
  const colorClasses = palette.classes;
  const gridStroke = palette.neutralGrid;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-md border bg-popover/90 backdrop-blur px-3 py-2 shadow-sm text-xs space-y-1">
        <p className="font-medium">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.dataKey}:</span>
            <span className="font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const metrics = [
    {
      title: "Member Growth",
      value:
        memberGrowthPct == null
          ? "--"
          : `${memberGrowthPct > 0 ? "+" : ""}${memberGrowthPct}%`,
      description: "vs prev 30 days",
      trend:
        memberGrowthPct == null ? null : memberGrowthPct >= 0 ? "up" : "down",
      icon: Users,
    },
    {
      title: "Class Attendance",
      value: classAttendancePct == null ? "--" : `${classAttendancePct}%`,
      description: "avg capacity fill",
      trend: null,
      icon: Calendar,
    },
    {
      title: "Revenue Growth",
      value:
        revenueGrowthPct == null
          ? "--"
          : `${revenueGrowthPct > 0 ? "+" : ""}${revenueGrowthPct}%`,
      description: "vs prev 30 days",
      trend:
        revenueGrowthPct == null ? null : revenueGrowthPct >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "Retention",
      value: retentionPct == null ? "--" : `${retentionPct}%`,
      description: "90+ day cohort",
      trend: null,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Analytics Dashboard{" "}
              <Badge variant="secondary" className="ml-2 text-xs uppercase">
                Beta
              </Badge>
              {demoMode && <Sparkles className="h-5 w-5 text-primary" />}
            </h2>
            <p className="text-muted-foreground">
              Track performance and business metrics{" "}
              {demoMode && "(demo data limits)"}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {metric.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Popular Classes (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Classes</CardTitle>
            <CardDescription>Top attendance (last 30d)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {popularClassSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {dataLoading ? "Loading..." : "No class data"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularClassSeries} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    width={30}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  />
                  <defs>
                    <linearGradient
                      id="popularBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={colorClasses}
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor={colorClasses}
                        stopOpacity={0.4}
                      />
                    </linearGradient>
                  </defs>
                  <Bar
                    dataKey="attendance"
                    name="Attendance %"
                    radius={[6, 6, 0, 0]}
                    fill="url(#popularBarGradient)"
                    stroke={colorClasses}
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trends (Area/Line Combo) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly gross revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {revenueSeries.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <DollarSign className="h-10 w-10 mb-2 opacity-50" />
                {dataLoading ? "Loading revenue..." : "No revenue data yet"}
                <span className="text-xs mt-1">
                  Add payments to build history
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueSeries}
                  margin={{ left: 4, right: 4, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colorRevenue}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor={colorRevenue}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="short"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    width={50}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const val = payload[0].value as number;
                      return (
                        <div className="rounded-md border bg-popover/90 backdrop-blur px-3 py-2 text-xs shadow-sm">
                          <p className="font-medium mb-1">{label}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-sm bg-primary" />
                            <span className="text-muted-foreground">
                              Revenue:
                            </span>
                            <span className="font-semibold">
                              {val.toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Revenue"
                    stroke={colorRevenue}
                    fill="url(#revGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={colorRevenue}
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Member Analytics</CardTitle>
              <CardDescription>
                {memberView === "active" && "Active members per month"}
                {memberView === "total" && "Cumulative members over time"}
              </CardDescription>
            </div>
            <Tabs
              value={memberView}
              onValueChange={(v: any) => setMemberView(v)}
              className="w-auto"
            >
              <TabsList className="grid grid-cols-3 h-9">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="total">Total</TabsTrigger>
                <TabsTrigger value="combined">Both</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {memberSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {members.length === 0
                ? "No members yet. Add members to see trends."
                : "Insufficient data to build timeline."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {memberView === "combined" ? (
                <LineChart
                  data={activeVsTotalCombined}
                  margin={{ left: 4, right: 8, top: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m) => m.slice(5)}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    width={40}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Active"
                    stroke={colorPrimary}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Total"
                    stroke={colorAccent}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    strokeDasharray="4 3"
                  />
                </LineChart>
              ) : (
                <AreaChart
                  data={memberDisplaySeries.map((d) => ({
                    month: d.month,
                    value: d.value,
                  }))}
                  margin={{ left: 4, right: 8, top: 10, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="memGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colorPrimary}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor={colorPrimary}
                        stopOpacity={0.06}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m) => m.slice(5)}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    width={40}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-md border bg-popover/90 backdrop-blur px-3 py-2 text-xs shadow-sm">
                          <p className="font-medium mb-1">{label}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-sm bg-primary" />
                            <span className="text-muted-foreground">
                              {memberView === "active" ? "Active" : "Total"}:
                            </span>
                            <span className="font-semibold">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    dataKey="value"
                    stroke={colorPrimary}
                    strokeWidth={2}
                    fill="url(#memGradient)"
                    type="monotone"
                  />
                  <Line
                    dataKey="value"
                    stroke={colorPrimary}
                    strokeWidth={2}
                    dot={{ r: 1.5 }}
                    type="monotone"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            {memberView === "active" &&
              `Active = visited within last ${ACTIVE_RECENCY_DAYS} days of each month (fallback to status when no visit history).`}
            {memberView === "total" &&
              "Total = cumulative members by join date (deletions not modeled)."}
            {memberView === "combined" &&
              `Compare recency-active vs total membership growth (active window ${ACTIVE_RECENCY_DAYS}d).`}
            {demoMode && " Demo mode figures are synthetic."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
