import {
  User,
  Trophy,
  Star,
  Shield,
  Crown,
  Plus,
  Edit,
  UserCheck,
  Users,
  Zap,
  Diamond,
  Gem,
  type LucideIcon,
} from "lucide-react";

export interface XPLevel {
  level: number;
  name: string;
  nextLevelXP: number;
  icon: LucideIcon;
  color: string; // text-* color used elsewhere
  badgeBg: string; // explicit bg-* class for badge
  bgColor: string; // card background accent
  borderColor: string; // card border color
  unlocks: string[];
}

// XP Level System Configuration
export const XP_LEVELS: XPLevel[] = [
  {
    level: 1,
    name: "Newcomer",
    nextLevelXP: 0,
    icon: User,
    color: "text-slate-600",
    badgeBg: "bg-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    unlocks: ["Access to basic features"],
  },
  {
    level: 2,
    name: "Contributor",
    nextLevelXP: 500,
    icon: Star,
    color: "text-green-600",
    badgeBg: "bg-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",

    unlocks: ["Dark mode"],
  },
  {
    level: 3,
    name: "Moderator",
    nextLevelXP: 1500,
    icon: Shield,
    color: "text-blue-600",
    badgeBg: "bg-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    unlocks: ["Moderator status and tools", "Skill-tree builder"],
  },
  {
    level: 4,
    name: "Expert",
    nextLevelXP: 3000,
    icon: Crown,
    color: "text-amber-600",
    badgeBg: "bg-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    unlocks: ["Request features", "Beta features access"],
  },
  {
    level: 5,
    name: "Legend",
    nextLevelXP: 5000,
    icon: Gem,
    color: "text-emerald-600",
    badgeBg: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    unlocks: ["Early access to Flipside", "Special recognition"],
  },
];

export const XP_ACTIONS = [
  {
    action: "Add a new trick",
    xp: "50-200 XP",
    icon: Plus,
    description: "Create comprehensive trick guides with detailed explanations",
    highlight: false,
  },
  {
    action: "Edit existing tricks",
    xp: "5-150 XP",
    icon: Edit,
    description: "Improve content quality based on the scope of changes made",
    highlight: false,
  },
  {
    action: "Invite a friend",
    xp: "250 XP",
    icon: UserCheck,
    description: "Most valuable - invite active users who contribute regularly",
    highlight: true,
  },
  //   {
  //     action: "Community engagement",
  //     xp: "10-25 XP",
  //     icon: Users,
  //     description:
  //       "Help others, answer questions, and participate in discussions",
  //     highlight: false,
  //   },
];
