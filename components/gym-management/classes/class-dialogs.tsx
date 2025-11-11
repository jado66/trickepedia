"use client";

import type React from "react";
import { useState } from "react";
import type { Member, ClassItem } from "@/types/gym-management";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge as InstructorBadge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  UserPlus,
  UserMinus,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { getInitials, computeAge } from "./class-utils";

interface CreateClassDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  disabled?: boolean;
  disabledMessage?: string;
  staff?: { id: string; name: string }[];
}

export function CreateClassDialog({
  isOpen,
  setIsOpen,
  onSubmit,
  disabled = false,
  disabledMessage = "Create Class",
  staff = [],
}: CreateClassDialogProps) {
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);

  const toggleInstructor = (name: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const clearInstructors = () => setSelectedInstructors([]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled}>
          <UserPlus className="mr-2 h-4 w-4" />
          {disabled ? disabledMessage : "Create Class"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Add a new class to your schedule. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-6">
          {/* Hidden field to submit instructors */}
          <input
            type="hidden"
            name="instructors"
            value={selectedInstructors.join(",")}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Yoga Flow"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="flex items-center justify-between">
                <span>Instructor(s)</span>
                {selectedInstructors.length > 0 && (
                  <button
                    type="button"
                    onClick={clearInstructors}
                    className="text-[10px] text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </Label>
              <div className="flex flex-wrap gap-1 min-h-8 rounded-md border bg-background/50 p-1">
                {selectedInstructors.length === 0 && (
                  <span className="text-[11px] text-muted-foreground pl-1 self-center">
                    No instructors selected
                  </span>
                )}
                {selectedInstructors.map((name) => (
                  <InstructorBadge
                    key={name}
                    variant="secondary"
                    className="text-[10px] flex items-center gap-1 pr-1"
                  >
                    {name}
                    <button
                      type="button"
                      className="hover:text-destructive"
                      onClick={() => toggleInstructor(name)}
                    >
                      ×
                    </button>
                  </InstructorBadge>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs flex items-center gap-2"
                  >
                    <span>Select instructors</span>
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search staff..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No staff found.</CommandEmpty>
                      <CommandGroup heading="Staff">
                        {staff.map((s) => {
                          const selected = selectedInstructors.includes(s.name);
                          return (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => toggleInstructor(s.name)}
                              className="flex items-center"
                            >
                              <Check
                                className={`h-4 w-4 mr-2 ${
                                  selected ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <span className="truncate text-xs">{s.name}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-muted-foreground">
                Choose one or more staff instructors. They will be saved when
                the class is created.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={12}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                defaultValue={60}
                min={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={0}
                min={0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue="Main Gym"
              placeholder="e.g., Studio A"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Class</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ManageStudentsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classItem: ClassItem | null;
  members: Member[];
  staff?: { id: string; name: string }[]; // list of staff for instructor selection
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  pagedMembers: Member[];
  filteredCount: number;
  enroll: (c: ClassItem, m: Member) => Promise<void>;
  unenroll: (c: ClassItem, m: Member) => Promise<void>;
  allowOverEnrollment?: boolean;
  onUpdateInstructors?: (c: ClassItem, instructors: string[]) => Promise<void>;
}

export function ManageStudentsDialog({
  open,
  onOpenChange,
  classItem,
  search,
  staff = [],
  setSearch,
  page,
  setPage,
  pageSize,
  pagedMembers,
  filteredCount,
  enroll,
  unenroll,
  allowOverEnrollment = false,
  onUpdateInstructors,
}: ManageStudentsDialogProps) {
  if (!classItem) return null;

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const enrollmentPercentage = (classItem.enrolled / classItem.capacity) * 100;
  const isOverEnrolled = classItem.enrolled > classItem.capacity;
  const cappedPercentage = Math.min(enrollmentPercentage, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex flex-col gap-2">
            <span>{classItem.name}</span>
          </DialogTitle>
          <DialogDescription>
            Manage student enrollments and update instructors for this class
          </DialogDescription>
        </DialogHeader>

        {onUpdateInstructors && staff.length > 0 && (
          <div className="space-y-2 mb-4">
            <Label className="text-xs uppercase tracking-wide">
              Instructors
            </Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {(classItem.instructors || []).length === 0 && (
                <span className="text-[11px] text-muted-foreground italic">
                  None selected
                </span>
              )}
              {(classItem.instructors || []).map((name) => (
                <InstructorBadge
                  key={name}
                  variant="secondary"
                  className="text-[10px] flex items-center gap-1 pr-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={async () => {
                      const next = (classItem.instructors || []).filter(
                        (n) => n !== name
                      );
                      await onUpdateInstructors?.(classItem, next);
                    }}
                    className="hover:text-destructive ml-0.5"
                  >
                    ×
                  </button>
                </InstructorBadge>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs flex items-center gap-2"
                >
                  <span>Select instructors</span>
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search staff..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No staff found.</CommandEmpty>
                    <CommandGroup heading="Staff">
                      {staff.map((s) => {
                        const selected = (classItem.instructors || []).includes(
                          s.name
                        );
                        return (
                          <CommandItem
                            key={s.id}
                            value={s.name}
                            onSelect={async () => {
                              let next = classItem.instructors || [];
                              if (selected) {
                                next = next.filter((n) => n !== s.name);
                              } else {
                                next = [...next, s.name];
                              }
                              await onUpdateInstructors?.(classItem, next);
                            }}
                            className="flex items-center"
                          >
                            <Check
                              className={`h-4 w-4 mr-2 ${
                                selected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <span className="truncate text-xs">{s.name}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-[10px] text-muted-foreground">
              Click to toggle staff; changes save immediately.
            </p>
          </div>
        )}

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
              {filteredCount} {filteredCount === 1 ? "member" : "members"} found
            </span>
            {totalPages > 1 && (
              <span>
                Page {page + 1} of {totalPages}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-2 min-h-[300px]">
          {pagedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No members found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            pagedMembers
              .sort((a, b) => {
                const aEnrolled = (classItem.students || []).includes(a.id);
                const bEnrolled = (classItem.students || []).includes(b.id);
                if (aEnrolled === bEnrolled) return 0;
                return aEnrolled ? -1 : 1;
              })
              .map((m) => {
                const enrolled = (classItem.students || []).includes(m.id);
                const isFull =
                  !allowOverEnrollment &&
                  classItem.enrolled >= classItem.capacity &&
                  !enrolled;

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
                        <div className="flex items-center gap-2 lg:min-w-[150px]">
                          <p className="font-medium truncate text-sm">
                            {m.name}
                          </p>
                          {enrolled && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4 px-1.5"
                            >
                              Enrolled
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground lg:flex-1">
                          <span className="truncate">{m.email}</span>
                          {m.phone && (
                            <>
                              <span>•</span>
                              <span>{m.phone}</span>
                            </>
                          )}
                          {((m as any).ageYears ?? computeAge(m.birthDate)) !==
                            undefined && (
                            <>
                              <span>•</span>
                              <span>
                                {(m as any).ageYears ?? computeAge(m.birthDate)}{" "}
                                yrs
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {enrolled ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unenroll(classItem, m)}
                          className="h-8"
                        >
                          <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                          Unenroll
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => enroll(classItem, m)}
                          disabled={isFull}
                          className="h-8"
                        >
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          {isFull ? "Class Full" : "Enroll"}
                        </Button>
                      )}
                    </div>
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
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
