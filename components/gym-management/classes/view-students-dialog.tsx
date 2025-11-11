"use client";

import type React from "react";
import type { Member, ClassItem } from "@/types/gym-management";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import { getInitials, computeAge } from "./class-utils";
import { useState, useMemo } from "react";

interface ViewStudentsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classItem: ClassItem | null;
  membersById: Map<string, Member>;
}

export function ViewStudentsDialog({
  open,
  onOpenChange,
  classItem,
  membersById,
}: ViewStudentsDialogProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const enrolledStudents = useMemo(() => {
    if (!classItem) return [];
    return (classItem.students || [])
      .map((id) => membersById.get(id))
      .filter((m): m is Member => m !== undefined);
  }, [classItem, membersById]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrolledStudents;
    return enrolledStudents.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q)
    );
  }, [enrolledStudents, search]);

  const pagedStudents = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE)
  );

  if (!classItem) return null;

  const enrollmentPercentage = (classItem.enrolled / classItem.capacity) * 100;
  const isOverEnrolled = classItem.enrolled > classItem.capacity;
  const cappedPercentage = Math.min(enrollmentPercentage, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{classItem.name}</DialogTitle>
          <DialogDescription>
            View all enrolled students for this class
          </DialogDescription>
        </DialogHeader>

        <div
          className={`rounded-lg p-4 space-y-3 ${
            isOverEnrolled
              ? "bg-orange-500/10 border border-orange-500/20"
              : "bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Class Capacity</span>
            <span
              className={
                isOverEnrolled
                  ? "text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1"
                  : "text-muted-foreground"
              }
            >
              {classItem.enrolled} / {classItem.capacity} enrolled
              {isOverEnrolled && <AlertTriangle className="h-3.5 w-3.5" />}
            </span>
          </div>
          <Progress
            value={cappedPercentage}
            className={`h-2 ${isOverEnrolled ? "[&>div]:bg-orange-500" : ""}`}
          />
          {isOverEnrolled && (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                Class is over-enrolled by{" "}
                {classItem.enrolled - classItem.capacity} student
                {classItem.enrolled - classItem.capacity > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredStudents.length}{" "}
              {filteredStudents.length === 1 ? "student" : "students"} enrolled
            </span>
            {totalPages > 1 && (
              <span>
                Page {page + 1} of {totalPages}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-2 min-h-[300px]">
          {pagedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No students found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? "Try adjusting your search criteria"
                  : "No students enrolled yet"}
              </p>
            </div>
          ) : (
            pagedStudents.map((m) => {
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-1 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center lg:gap-4">
                      <p className="font-medium truncate text-sm lg:min-w-[150px]">
                        {m.name}
                      </p>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-3 lg:flex-1">
                        {m.email && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{m.email}</span>
                          </div>
                        )}
                        {m.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{m.phone}</span>
                          </div>
                        )}
                        {((m as any).ageYears ?? computeAge(m.birthDate)) !== undefined && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="truncate">{((m as any).ageYears ?? computeAge(m.birthDate))} yrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    Enrolled
                  </Badge>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page <= 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
