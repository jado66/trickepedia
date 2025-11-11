"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, MapPin, Repeat, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  onCreateEvent: () => void;
  onViewScheduler: () => void;
  onManageResources: () => void;
  onManageInstructors: () => void;
  onViewRecurring: () => void;
  onViewAnalytics: () => void;
}

export function QuickActions({
  onCreateEvent,
  onViewScheduler,
  onManageResources,
  onManageInstructors,
  onViewRecurring,
  onViewAnalytics,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Create Event",
      description: "Schedule a new class or event",
      icon: Plus,
      onClick: onCreateEvent,
      variant: "default" as const,
    },
    {
      title: "View Scheduler",
      description: "Drag & drop scheduling interface",
      icon: Calendar,
      onClick: onViewScheduler,
      variant: "outline" as const,
    },
    {
      title: "Manage Resources",
      description: "Add or edit facilities and equipment",
      icon: MapPin,
      onClick: onManageResources,
      variant: "outline" as const,
    },
    {
      title: "Manage Instructors",
      description: "Add or edit instructor profiles",
      icon: Users,
      onClick: onManageInstructors,
      variant: "outline" as const,
    },
    {
      title: "Recurring Events",
      description: "Manage recurring classes and events",
      icon: Repeat,
      onClick: onViewRecurring,
      variant: "outline" as const,
    },
    {
      title: "View Analytics",
      description: "Detailed reports and insights",
      icon: BarChart3,
      onClick: onViewAnalytics,
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
