import type { Trick } from "@/types/trick";
import type { MasterCategory } from "../skill-tree.types";

export interface CategoryProgress {
  category: MasterCategory;
  completed: number;
  total: number;
  percentage: number;
  recentlyCompleted: number;
}

export interface TotalStats {
  totalTricks: number;
  completedTricks: number;
  percentage: number;
  recentlyCompleted: number;
}

export interface TrickWithProgress extends Trick {
  user_can_do: boolean;
  missing_prerequisites: string[];
  category_progress: number; // fraction 0..1
}
