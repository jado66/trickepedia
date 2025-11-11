"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function StaffScheduleDialog({
  open,
  onOpenChange,
  selectedStaffMember,
  selectedDate,
  setSelectedDate,
  viewMode,
  setViewMode,
  levelFilter,
  setLevelFilter,
  classes = [],
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {selectedStaffMember
              ? `${selectedStaffMember.name} — Schedule`
              : "Schedule"}
          </DialogTitle>
          <DialogDescription>
            View assigned classes for this coach. Toggle between month and list
            views and filter by level.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label>Level</Label>
                <Select
                  value={levelFilter}
                  onValueChange={(v: string) => setLevelFilter(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {viewMode === "month" ? (
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
              />
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  List of upcoming classes for this coach.
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-2">Classes</h4>
            <div className="space-y-2 max-h-96 overflow-auto">
              {classes
                .filter((c: any) =>
                  selectedStaffMember
                    ? (c.instructors || []).includes(selectedStaffMember.name)
                    : true
                )
                .filter((c: any) =>
                  levelFilter === "All" ? true : c.level === levelFilter
                )
                .map((c: any) => (
                  <div key={c.id} className="border rounded p-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.time}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{c.location}</div>
                        <div className="text-muted-foreground">{c.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
