"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { Network, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useUserProgress } from "@/contexts/user-progress-provider";

interface UserProgressOverviewProps {
  className?: string;
  title?: string;
}

export function UserProgressOverview({
  className,
  title = "Your Progress",
}: UserProgressOverviewProps) {
  const { progressStats, loading } = useUserProgress();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Loading progress...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 " />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressStats.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No progress recorded yet.
          </div>
        )}
        {progressStats.map((stat) => (
          <div key={stat.sport} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start">
                <h6 className="font-semibold text-sm md:text-lg truncate pr-4">
                  {stat.sport}
                </h6>
                {/* Skill Tree link with tooltip */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hover:text-accent-foreground"
                      >
                        <Link
                          href={`/${stat.slug}/skill-tree`}
                          aria-label={`${stat.sport} Skill Tree`}
                        >
                          <Network className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {`${stat.sport} Skill Tree`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <span className="hidden md:inline-block text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                {stat.mastered}/{stat.total} mastered ({stat.percentage}%)
              </span>
            </div>
            <Progress
              value={stat.percentage}
              className="h-3 [&>div]:bg-accent"
            />
            {/* Mobile stats below progress bar */}
            <span className="md:hidden block text-xs text-muted-foreground mt-1">
              {stat.mastered}/{stat.total} mastered ({stat.percentage}%)
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
