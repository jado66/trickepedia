"use client";

import { useGym } from "@/contexts/gym/gym-provider";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function DemoBadge() {
  const { demoMode } = useGym();
  return !demoMode ? null : (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Sparkles className="h-3 w-3" /> Demo Mode
    </Badge>
  );
}
