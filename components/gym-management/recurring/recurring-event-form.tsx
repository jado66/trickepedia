"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Repeat } from "lucide-react";

interface RecurringEventFormProps {
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  onChange: (
    recurring: {
      frequency: "daily" | "weekly" | "monthly";
      interval: number;
      endDate?: Date;
      daysOfWeek?: number[];
    } | null
  ) => void;
}

export function RecurringEventForm({
  recurring,
  onChange,
}: RecurringEventFormProps) {
  const [isRecurring, setIsRecurring] = useState(!!recurring);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    recurring?.frequency || "weekly"
  );
  const [interval, setInterval] = useState(recurring?.interval || 1);
  const [endDate, setEndDate] = useState(
    recurring?.endDate?.toISOString().split("T")[0] || ""
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    recurring?.daysOfWeek || []
  );

  const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const handleRecurringToggle = (enabled: boolean) => {
    setIsRecurring(enabled);
    if (!enabled) {
      onChange(null);
    } else {
      updateRecurring();
    }
  };

  const updateRecurring = () => {
    if (!isRecurring) return;

    const recurringData = {
      frequency,
      interval,
      endDate: endDate ? new Date(endDate) : undefined,
      daysOfWeek:
        frequency === "weekly" && selectedDays.length > 0
          ? selectedDays
          : undefined,
    };

    onChange(recurringData);
  };

  const toggleDay = (dayValue: number) => {
    const newSelectedDays = selectedDays.includes(dayValue)
      ? selectedDays.filter((d) => d !== dayValue)
      : [...selectedDays, dayValue].sort();

    setSelectedDays(newSelectedDays);

    // Update parent immediately
    if (isRecurring) {
      const recurringData = {
        frequency,
        interval,
        endDate: endDate ? new Date(endDate) : undefined,
        daysOfWeek:
          frequency === "weekly" && newSelectedDays.length > 0
            ? newSelectedDays
            : undefined,
      };
      onChange(recurringData);
    }
  };

  const handleFrequencyChange = (
    newFrequency: "daily" | "weekly" | "monthly"
  ) => {
    setFrequency(newFrequency);
    if (newFrequency !== "weekly") {
      setSelectedDays([]);
    }

    if (isRecurring) {
      const recurringData = {
        frequency: newFrequency,
        interval,
        endDate: endDate ? new Date(endDate) : undefined,
        daysOfWeek:
          newFrequency === "weekly" && selectedDays.length > 0
            ? selectedDays
            : undefined,
      };
      onChange(recurringData);
    }
  };

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    updateRecurring();
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);

    if (isRecurring) {
      const recurringData = {
        frequency,
        interval,
        endDate: newEndDate ? new Date(newEndDate) : undefined,
        daysOfWeek:
          frequency === "weekly" && selectedDays.length > 0
            ? selectedDays
            : undefined,
      };
      onChange(recurringData);
    }
  };

  const getFrequencyDescription = () => {
    if (!isRecurring) return "";

    let description = `Repeats every ${
      interval > 1 ? interval : ""
    } ${frequency}`;
    if (interval > 1) {
      description +=
        frequency === "daily"
          ? " days"
          : frequency === "weekly"
          ? " weeks"
          : " months";
    }

    if (frequency === "weekly" && selectedDays.length > 0) {
      const dayNames = selectedDays
        .map((day) => daysOfWeek.find((d) => d.value === day)?.label)
        .join(", ");
      description += ` on ${dayNames}`;
    }

    if (endDate) {
      description += ` until ${new Date(endDate).toLocaleDateString()}`;
    }

    return description;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="h-4 w-4" />
          Recurring Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring-toggle">Make this a recurring event</Label>
          <Switch
            id="recurring-toggle"
            checked={isRecurring}
            onCheckedChange={handleRecurringToggle}
          />
        </div>

        {isRecurring && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interval">Every</Label>
                <Select
                  value={interval.toString()}
                  onValueChange={(value) =>
                    handleIntervalChange(Number.parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {frequency}
                        {num > 1 &&
                          (frequency === "daily"
                            ? "s"
                            : frequency === "weekly"
                            ? "s"
                            : "s")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {frequency === "weekly" && (
              <div>
                <Label>Days of the week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <Badge
                      key={day.value}
                      variant={
                        selectedDays.includes(day.value) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Select days of the week for this recurring event
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="end-date">End date (optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {getFrequencyDescription() && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Recurrence Summary</p>
                    <p className="text-sm text-muted-foreground">
                      {getFrequencyDescription()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
