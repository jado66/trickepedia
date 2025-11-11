"use client";

import { useMemo } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { ClassItem, PaymentItem, Member } from "@/types/gym-management";

interface PopularClass {
  id: string;
  name: string;
  attendancePct: number; // 0-100
  enrolled: number;
  capacity: number;
}

interface RevenuePoint {
  month: string; // e.g. 2024-01
  total: number; // numeric total
}

export interface GymAnalyticsResult {
  loading: boolean;
  memberGrowthPct: number | null;
  classAttendancePct: number | null;
  revenueGrowthPct: number | null;
  retentionPct: number | null;
  popularClasses: PopularClass[];
  revenueHistory: RevenuePoint[];
  raw: {
    members: Member[];
    classes: ClassItem[];
    payments: PaymentItem[];
  };
}

function parseCurrency(amount: string): number {
  if (!amount) return 0;
  const cleaned = amount.replace(/[^0-9.-]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function pct(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 100);
}

export function useGymAnalytics(): GymAnalyticsResult {
  const { loading, members, classes, payments } = useGym();

  return useMemo(() => {
    if (loading) {
      return {
        loading: true,
        memberGrowthPct: null,
        classAttendancePct: null,
        revenueGrowthPct: null,
        retentionPct: null,
        popularClasses: [],
        revenueHistory: [],
        raw: { members, classes, payments },
      } as GymAnalyticsResult;
    }

    const now = new Date();
    const msDay = 24 * 60 * 60 * 1000;
    const last30Start = new Date(now.getTime() - 30 * msDay);
    const prev30Start = new Date(now.getTime() - 60 * msDay);

    // Member growth: new members last 30 vs previous 30
    const last30 = members.filter((m) => new Date(m.joinDate) >= last30Start);
    const prev30 = members.filter(
      (m) =>
        new Date(m.joinDate) < last30Start &&
        new Date(m.joinDate) >= prev30Start
    );
    let memberGrowthPct: number | null = null;
    if (prev30.length === 0 && last30.length > 0)
      memberGrowthPct = 100; // baseline
    else
      memberGrowthPct =
        pct(last30.length - prev30.length, prev30.length) ?? null;

    // Class attendance average (enrolled/capacity for active classes)
    const activeClasses = classes.filter((c) => c.status !== "inactive");
    const attendanceFractions = activeClasses
      .filter((c) => c.capacity > 0)
      .map((c) => c.enrolled / c.capacity);
    const classAttendancePct = attendanceFractions.length
      ? Math.round(
          (attendanceFractions.reduce((a, b) => a + b, 0) /
            attendanceFractions.length) *
            100
        )
      : null;

    // Revenue growth last 30 vs previous 30 (by payment date)
    const last30Payments = payments.filter(
      (p) => new Date(p.date) >= last30Start
    );
    const prev30Payments = payments.filter(
      (p) => new Date(p.date) < last30Start && new Date(p.date) >= prev30Start
    );
    const sum = (arr: PaymentItem[]) =>
      arr.reduce((acc, p) => acc + parseCurrency(p.amount), 0);
    const last30Rev = sum(last30Payments);
    const prev30Rev = sum(prev30Payments);
    let revenueGrowthPct: number | null = null;
    if (prev30Rev === 0 && last30Rev > 0) revenueGrowthPct = 100;
    else if (prev30Rev > 0)
      revenueGrowthPct = Math.round(
        ((last30Rev - prev30Rev) / prev30Rev) * 100
      );

    // Retention: active members who joined > 90 days ago / members who joined > 90 days ago
    const ninetyDaysAgo = new Date(now.getTime() - 90 * msDay);
    const cohort = members.filter((m) => new Date(m.joinDate) < ninetyDaysAgo);
    const retained = cohort.filter((m) => m.status === "active");
    const retentionPct =
      pct(retained.length, cohort.length) ?? (cohort.length === 0 ? 100 : null);

    // Popular classes: top 4 by attendance ratio
    const popularClasses = [...activeClasses]
      .filter((c) => c.capacity > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        attendancePct: Math.round((c.enrolled / c.capacity) * 100),
        enrolled: c.enrolled,
        capacity: c.capacity,
      }))
      .sort((a, b) => b.attendancePct - a.attendancePct)
      .slice(0, 4);

    // Revenue history last 6 months (inclusive current)
    const revenueHistory: RevenuePoint[] = (() => {
      const map = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        map.set(key, 0);
      }
      payments.forEach((p) => {
        const d = new Date(p.date);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        if (map.has(key)) {
          map.set(key, (map.get(key) || 0) + parseCurrency(p.amount));
        }
      });
      return Array.from(map.entries()).map(([month, total]) => ({
        month,
        total,
      }));
    })();

    return {
      loading: false,
      memberGrowthPct,
      classAttendancePct,
      revenueGrowthPct,
      retentionPct,
      popularClasses,
      revenueHistory,
      raw: { members, classes, payments },
    };
  }, [loading, members, classes, payments]);
}
