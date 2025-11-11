"use client";

import { useMemo, useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import type { Member, ClassItem } from "@/types/gym-management";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  TableIcon,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { GridView, ListView, TableView } from "./class-views";
import type { ViewMode, SortField, SortOrder } from "./class-utils";
import { getCapacityStatus } from "./class-utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { CreateClassDialog, ManageStudentsDialog } from "./class-dialogs";
import { ViewStudentsDialog } from "./view-students-dialog";

export function Classes() {
  const {
    classes,
    members,
    addClass,
    updateClass,
    demoMode,
    limits,
    allowOverEnrollment,
    staff,
  } = useGym();
  const [isOpen, setIsOpen] = useState(false);

  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "gym-management-classes-view-mode",
    "grid"
  );
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Manage students dialog state (scalable search + pagination)
  const [manageOpen, setManageOpen] = useState(false);
  const [manageClass, setManageClass] = useState<ClassItem | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  // View students dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewClass, setViewClass] = useState<ClassItem | null>(null);

  const handleCreate = async (formData: FormData) => {
    const name = formData.get("name") as string;
    // Support multiple instructors (comma separated)
    const instructorsRaw = (formData.get("instructors") as string) || "";
    const instructors = instructorsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const capacity = Number.parseInt(
      (formData.get("capacity") as string) || "0"
    );
    const location = formData.get("location") as string;
    const duration = Number.parseInt(
      (formData.get("duration") as string) || "60"
    );
    const price = Number.parseFloat((formData.get("price") as string) || "0");
    await addClass({
      name,
      instructors,
      time: "TBD",
      capacity,
      location,
      level: "All Levels",
      status: "active",
      description: "",
      duration,
      price,
      ageRange: "All",
      students: [],
      enrolled: 0,
    } as any);
    setIsOpen(false);
  };

  const enroll = async (classItem: ClassItem, member: Member) => {
    if ((classItem.students || []).includes(member.id)) return;
    if (!allowOverEnrollment && classItem.enrolled >= classItem.capacity) {
      alert("Class is full");
      return;
    }
    const students = Array.from(
      new Set([...(classItem.students || []), member.id])
    );
    await updateClass(classItem.id, { students, enrolled: students.length });
  };

  const unenroll = async (classItem: ClassItem, member: Member) => {
    if (!classItem.students || !classItem.students.includes(member.id)) return;
    const students = (classItem.students || []).filter(
      (id) => id !== member.id
    );
    await updateClass(classItem.id, { students, enrolled: students.length });
  };

  const membersById = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m: any) => map.set(m.id, m));
    return map;
  }, [members]);

  const openManage = (c: ClassItem) => {
    setManageClass(c);
    setSearch("");
    setPage(0);
    setManageOpen(true);
  };

  const openView = (c: ClassItem) => {
    setViewClass(c);
    setViewOpen(true);
  };

  const filteredMembers = useMemo(() => {
    if (!members) return [] as Member[];
    const q = search.trim().toLowerCase();
    if (!q) return members as Member[];
    return (members as Member[]).filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q)
    );
  }, [members, search]);

  const pagedMembers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  // Keep manageClass in sync with the updated class data
  const currentManageClass = useMemo(() => {
    if (!manageClass) return null;
    return classes.find((c: any) => c.id === manageClass.id) || manageClass;
  }, [classes, manageClass]);

  // Keep viewClass in sync with the updated class data
  const currentViewClass = useMemo(() => {
    if (!viewClass) return null;
    return classes.find((c: any) => c.id === viewClass.id) || viewClass;
  }, [classes, viewClass]);

  const filteredAndSortedClasses = useMemo(() => {
    let filtered = [...classes];

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) => {
        const instructorNames = (
          c.instructors && c.instructors.length
            ? c.instructors
            : c.instructor
            ? [c.instructor]
            : []
        )
          .join(" ")
          .toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          instructorNames.includes(q) ||
          c.location.toLowerCase().includes(q)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c: any) => {
        const status = getCapacityStatus(c.enrolled, c.capacity);
        return status.text.toLowerCase() === statusFilter;
      });
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "instructor":
          aVal = (a.instructors || []).join(" ").toLowerCase();
          bVal = (b.instructors || []).join(" ").toLowerCase();
          break;
        case "enrolled":
          aVal = a.enrolled;
          bVal = b.enrolled;
          break;
        case "capacity":
          aVal = a.capacity;
          bVal = b.capacity;
          break;
        case "location":
          aVal = a.location.toLowerCase();
          bVal = b.location.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [classes, searchQuery, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground">
            Manage your class schedule and student enrollments
          </p>
        </div>
        <CreateClassDialog
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onSubmit={handleCreate}
          disabled={demoMode && classes.length >= limits.classes}
          disabledMessage="Demo Limit Reached"
          staff={staff.map((s: any) => ({ id: s.id, name: s.name }))}
        />
      </div>

      {classes.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="almost full">Almost Full</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredAndSortedClasses.length}{" "}
              {filteredAndSortedClasses.length === 1 ? "class" : "classes"}
            </span>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as ViewMode)}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {filteredAndSortedClasses.length === 0 && classes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first class
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </CardContent>
        </Card>
      ) : filteredAndSortedClasses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "grid" && (
            <GridView
              classes={filteredAndSortedClasses}
              openManage={openManage}
              openView={openView}
              membersById={membersById}
              unenroll={unenroll}
            />
          )}
          {viewMode === "list" && (
            <ListView
              classes={filteredAndSortedClasses}
              openManage={openManage}
              openView={openView}
              membersById={membersById}
            />
          )}
          {viewMode === "table" && (
            <TableView
              classes={filteredAndSortedClasses}
              openManage={openManage}
              openView={openView}
              sortField={sortField}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
            />
          )}
        </>
      )}

      <ManageStudentsDialog
        open={manageOpen}
        onOpenChange={(v) => setManageOpen(v)}
        classItem={currentManageClass}
        members={members}
        staff={staff.map((s: any) => ({ id: s.id, name: s.name }))}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        pageSize={PAGE_SIZE}
        pagedMembers={pagedMembers as any}
        filteredCount={filteredMembers.length}
        allowOverEnrollment={allowOverEnrollment}
        enroll={async (c, m) => {
          await enroll(c, m);
        }}
        unenroll={async (c, m) => {
          await unenroll(c, m);
        }}
        onUpdateInstructors={async (c, instructors) => {
          await updateClass(c.id, { instructors });
        }}
      />

      <ViewStudentsDialog
        open={viewOpen}
        onOpenChange={(v) => setViewOpen(v)}
        classItem={currentViewClass}
        membersById={membersById}
      />
    </div>
  );
}
