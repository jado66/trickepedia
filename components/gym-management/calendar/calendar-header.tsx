"use client";
import type { CalendarView } from "@/types/gym/scheduling";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Grid3X3,
} from "lucide-react";

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
}

export function CalendarHeader({
  view,
  onViewChange,
  onNavigate,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};

    switch (view.type) {
      case "day":
        options.weekday = "long";
        options.year = "numeric";
        options.month = "long";
        options.day = "numeric";
        break;
      case "week":
        const weekStart = new Date(view.date);
        weekStart.setDate(view.date.getDate() - view.date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString("en-US", {
            month: "long",
          })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
          return `${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEnd.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}, ${weekStart.getFullYear()}`;
        }
      case "month":
        options.year = "numeric";
        options.month = "long";
        break;
    }

    return view.date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-lg font-medium text-muted-foreground">
          {formatTitle()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={view.type === "day" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange({ ...view, type: "day" })}
          >
            <Clock className="h-4 w-4 mr-1" />
            Day
          </Button>
          <Button
            variant={view.type === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange({ ...view, type: "week" })}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={view.type === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange({ ...view, type: "month" })}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Month
          </Button>
        </div>
      </div>
    </div>
  );
}
