import {
  Users,
  Calendar,
  UserPlus,
  Wrench,
  CreditCard,
  CheckCircle,
  FileText,
  AlertTriangle,
  Activity,
  School,
  GraduationCap,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface GymNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string; // short blurb used in add apps panel
}

// Base list of available "apps" (modules) in the gym management area.
// Order here represents the default ordering for first‑time / reset users.
export const BASE_GYM_NAV_ITEMS: GymNavItem[] = [
  {
    id: "members",
    label: "Members",
    icon: Users,
    description: "Manage member profiles, status & contact details.",
  },
  {
    id: "classes",
    label: "Classes",
    icon: GraduationCap,
    description: "Schedule, capacity & attendance for classes.",
  },
  {
    id: "scheduling",
    label: "Scheduling",
    icon: Calendar,
    description: "Visual calendar and date assignment for class sessions.",
  },
  {
    id: "staff",
    label: "Staff",
    icon: UserPlus,
    description: "Coaches & employee directory and roles.",
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: Wrench,
    description: "Track equipment inventory & maintenance cycles.",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    description: "Billing, invoices & subscription status.",
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: CheckCircle,
    description: "Front-desk member & guest check-in station.",
  },
  {
    id: "waivers",
    label: "Waivers",
    icon: FileText,
    description: "Signed waivers & document records.",
  },
  {
    id: "incidents",
    label: "Incidents",
    icon: AlertTriangle,
    description: "Log and follow up on safety & injury reports.",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Activity,
    description: "KPIs & performance dashboards.",
  },
  {
    id: "store",
    label: "Store",
    icon: Package,
    description: "Manage retail products, inventory & sales.",
  },
];

export function findNavItem(id: string): GymNavItem | undefined {
  return BASE_GYM_NAV_ITEMS.find((i) => i.id === id);
}
