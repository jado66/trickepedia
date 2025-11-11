"use client";

import type React from "react";
import type { Member, ClassItem } from "@/types/gym-management";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MapPin,
  Clock,
  DollarSign,
  UserPlus,
  UserMinus,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SortField, SortOrder } from "./class-utils";
import { getCapacityStatus, getInitials } from "./class-utils";

interface GridViewProps {
  classes: ClassItem[];
  openManage: (c: ClassItem) => void;
  openView: (c: ClassItem) => void;
  membersById: Map<string, Member>;
  unenroll: (c: ClassItem, m: Member) => Promise<void>;
}

export function GridView({
  classes,
  openManage,
  openView,
  membersById,
  unenroll,
}: GridViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {classes.map((c) => {
        const capacityStatus = getCapacityStatus(c.enrolled, c.capacity);
        const enrollmentPercentage = (c.enrolled / c.capacity) * 100;
        const isOverEnrolled = c.enrolled > c.capacity;
        const cappedPercentage = Math.min(enrollmentPercentage, 100);

        return (
          <Card key={c.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-xl">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {c.instructors && c.instructors.length
                      ? c.instructors.join(", ")
                      : "Unassigned"}
                  </p>
                </div>
                <Badge variant={capacityStatus.color as any}>
                  {capacityStatus.text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{c.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{c.duration} min</span>
                </div>
                {c.price > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${c.price.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enrollment
                  </span>
                  <span
                    className={
                      isOverEnrolled
                        ? "text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1"
                        : "text-muted-foreground"
                    }
                  >
                    {c.enrolled} / {c.capacity}
                    {isOverEnrolled && <AlertTriangle className="h-3 w-3" />}
                  </span>
                </div>
                <Progress
                  value={cappedPercentage}
                  className={`h-2 ${
                    isOverEnrolled ? "[&>div]:bg-orange-500" : ""
                  }`}
                />
                {isOverEnrolled && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Over-enrolled by {c.enrolled - c.capacity}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Enrolled Students</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openManage(c)}
                  >
                    <UserPlus className="mr-2 h-3 w-3" />
                    Manage
                  </Button>
                </div>

                {(c.students || []).length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                    No students enrolled yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(c.students || []).slice(0, 4).map((id: string) => {
                      const m = membersById.get(id);
                      if (!m) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(m.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{m.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {m.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => unenroll(c, m)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {(c.students || []).length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => openView(c)}
                      >
                        View all {(c.students || []).length} students
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface ListViewProps {
  classes: ClassItem[];
  openManage: (c: ClassItem) => void;
  openView: (c: ClassItem) => void;
  membersById: Map<string, Member>;
}

export function ListView({
  classes,
  openManage,
  openView,
  membersById,
}: ListViewProps) {
  return (
    <div className="space-y-3">
      {classes.map((c) => {
        const capacityStatus = getCapacityStatus(c.enrolled, c.capacity);
        const enrollmentPercentage = (c.enrolled / c.capacity) * 100;
        const isOverEnrolled = c.enrolled > c.capacity;
        const cappedPercentage = Math.min(enrollmentPercentage, 100);

        return (
          <Card key={c.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {c.instructors && c.instructors.length
                          ? c.instructors.join(", ")
                          : "Unassigned"}
                      </p>
                    </div>
                    <Badge variant={capacityStatus.color as any}>
                      {capacityStatus.text}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{c.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{c.duration} min</span>
                    </div>
                    {c.price > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${c.price.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {c.enrolled} / {c.capacity} enrolled
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={cappedPercentage}
                      className={`h-2 ${
                        isOverEnrolled ? "[&>div]:bg-orange-500" : ""
                      }`}
                    />
                    {isOverEnrolled && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Over-enrolled by {c.enrolled - c.capacity} student
                        {c.enrolled - c.capacity > 1 ? "s" : ""}
                      </div>
                    )}
                    {(c.students || []).length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {(c.students || []).slice(0, 5).map((id: string) => {
                            const m = membersById.get(id);
                            if (!m) return null;
                            return (
                              <Avatar
                                key={id}
                                className="h-7 w-7 border-2 border-background"
                              >
                                <AvatarFallback className="text-xs">
                                  {getInitials(m.name)}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })}
                        </div>
                        {(c.students || []).length > 5 && (
                          <button
                            onClick={() => openView(c)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline-offset-2 hover:underline"
                          >
                            +{(c.students || []).length - 5} more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" onClick={() => openManage(c)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface TableViewProps {
  classes: ClassItem[];
  openManage: (c: ClassItem) => void;
  openView: (c: ClassItem) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  toggleSort: (field: SortField) => void;
}

export function TableView({
  classes,
  openManage,
  openView,
  sortField,
  sortOrder,
  toggleSort,
}: TableViewProps) {
  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=active]:bg-accent"
      onClick={() => toggleSort(field)}
    >
      {children}
      <ArrowUpDown
        className={`ml-2 h-4 w-4 ${
          sortField === field ? "opacity-100" : "opacity-50"
        }`}
      />
    </Button>
  );

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Class Name</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="instructor">Instructor</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="location">Location</SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton field="enrolled">Enrollment</SortButton>
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((c) => {
            const capacityStatus = getCapacityStatus(c.enrolled, c.capacity);
            const enrollmentPercentage = (c.enrolled / c.capacity) * 100;
            const isOverEnrolled = c.enrolled > c.capacity;
            const cappedPercentage = Math.min(enrollmentPercentage, 100);

            return (
              <TableRow key={c.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {c.duration}m
                      </span>
                      {c.price > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />$
                          {c.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {c.instructors && c.instructors.length
                    ? c.instructors.join(", ")
                    : "Unassigned"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {c.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div
                      className={`text-center text-sm font-medium ${
                        isOverEnrolled
                          ? "text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1"
                          : ""
                      }`}
                    >
                      {c.enrolled} / {c.capacity}
                      {isOverEnrolled && <AlertTriangle className="h-3 w-3" />}
                    </div>
                    <Progress
                      value={cappedPercentage}
                      className={`h-1.5 ${
                        isOverEnrolled ? "[&>div]:bg-orange-500" : ""
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={capacityStatus.color as any}>
                    {capacityStatus.text}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openView(c)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openManage(c)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
