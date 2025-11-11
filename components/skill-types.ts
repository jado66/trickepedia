export interface Skill {
  id: string;
  name: string;
  description: string;
  prerequisite_ids: string[];
  tier: number;
  completed: boolean;
  category: "basic" | "intermediate" | "advanced" | "master";
}
