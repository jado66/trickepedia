import { User, Star, Shield, Crown, Gem, type LucideIcon } from "lucide-react";

export interface XPLevel {
  level: number;
  name: string;
  nextLevelXP: number; // XP required to reach this level from previous
  icon: LucideIcon;
  color: string; // text-* utility
  badgeBg: string; // bg-* class for badge
  bgColor: string; // background accent class
  borderColor: string; // border color class
  unlocks: string[];
}

export const XP_LEVELS: XPLevel[] = [
  {
    level: 1,
    name: "Newcomer",
    nextLevelXP: 0,
    icon: User,
    color: "text-slate-600 dark:text-slate-300",
    badgeBg: "bg-slate-600 dark:bg-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-900",
    borderColor: "border-slate-200 dark:border-slate-700/70",
    unlocks: ["Access to basic features"],
  },
  {
    level: 2,
    name: "Contributor",
    nextLevelXP: 500,
    icon: Star,
    color: "text-green-600 dark:text-green-400",
    badgeBg: "bg-green-600 dark:bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-900",
    borderColor: "border-green-200 dark:border-green-700/60",
    unlocks: ["Dark mode"],
  },
  {
    level: 3,
    name: "Moderator",
    nextLevelXP: 1500,
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-600 dark:bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900",
    borderColor: "border-blue-200 dark:border-blue-700/60",
    unlocks: ["Moderator status and tools", "Skill-tree builder"],
  },
  {
    level: 4,
    name: "Expert",
    nextLevelXP: 3000,
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-600 dark:bg-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900",
    borderColor: "border-amber-200 dark:border-amber-700/60",
    unlocks: ["Request features", "Beta features access"],
  },
  {
    level: 5,
    name: "Legend",
    nextLevelXP: 5000,
    icon: Gem,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-600 dark:bg-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900",
    borderColor: "border-emerald-200 dark:border-emerald-700/60",
    unlocks: ["Early access to Flipside", "Special recognition"],
  },
];

export interface XPCalcResult {
  currentLevel: XPLevel;
  nextLevel?: XPLevel;
  progressPct: number; // 0-100 within current level
  xpToNext: number; // XP remaining to reach next level (0 if max)
  totalXP: number;
}

export function calculateXPProgress(totalXP: number): XPCalcResult {
  const ordered = XP_LEVELS;
  const current =
    [...ordered].reverse().find((lvl) => totalXP >= lvl.nextLevelXP) ||
    ordered[0];
  const next = ordered.find((lvl) => lvl.level === current.level + 1);
  let progressPct = 100;
  let xpToNext = 0;
  if (next) {
    const span = next.nextLevelXP - current.nextLevelXP;
    progressPct = Math.min(100, ((totalXP - current.nextLevelXP) / span) * 100);
    xpToNext = Math.max(0, next.nextLevelXP - totalXP);
  }
  return {
    currentLevel: current,
    nextLevel: next,
    progressPct,
    xpToNext,
    totalXP,
  };
}
