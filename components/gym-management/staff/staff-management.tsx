"use client";

import { useState, useMemo } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Calendar,
  Plus,
  Phone,
  Mail,
  Search,
  LayoutGrid,
  TableIcon,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import AddStaffDialog from "./add-staff-dialog";
import EditStaffDialog from "./edit-staff-dialog";
import StaffScheduleDialog from "./staff-schedule-dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Separator } from "../../ui/separator";

// Local interface no longer needed (types come from provider) but kept minimal if TS needs shape hints
interface StaffMemberBasic {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialties: string[];
  schedule: string;
  classes: number;
  hourlyRate: number;
  certifications: string[];
  emergencyContact: string;
}

export function StaffManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    staff,
    staffAll,
    classes,
    addStaff,
    archiveStaff,
    unarchiveStaff,
    removeStaff,
    demoMode,
    limits,
  } = useGym();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<any | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useLocalStorage<"month" | "list">(
    "gym-management-staff-view",
    "month"
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [layout, setLayout] = useLocalStorage<"card" | "table">(
    "gym-management-staff-layout",
    "card"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const filteredStaff = useMemo(() => {
    // start from the appropriate source depending on status filter
    const base =
      statusFilter === "all"
        ? staffAll
        : statusFilter === "archived"
        ? staffAll.filter((s: any) => s.archived)
        : staff;
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return base;
    return base.filter((s: any) => {
      const specialties = (s.specialties || []).join(" ").toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.role || "").toLowerCase().includes(q) ||
        specialties.includes(q)
      );
    });
  }, [staff, staffAll, searchQuery, statusFilter]);

  const handleAddStaff = async (formData: FormData) => {
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const certifications = (formData.get("certifications") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // schedule will be determined by assigned classes; store empty string for now
    const res = await addStaff({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as string,
      specialties,
      status: "active",
      schedule: "",
      hourlyRate: Number.parseFloat(formData.get("hourlyRate") as string),
      certifications,
      emergencyContact: formData.get("emergencyContact") as string,
    });
    if (!res.success) {
      alert(res.error);
      return;
    }
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Staff</h2>
          <p className="text-muted-foreground">
            Manage your staff members and their schedules
          </p>
        </div>
        <AddStaffDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>

      {staff.length > 0 && (
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
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredStaff.length}{" "}
              {filteredStaff.length === 1 ? "staff" : "staff"}
            </span>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup
              type="single"
              value={layout}
              onValueChange={(v: string) => setLayout(v as "card" | "table")}
            >
              <ToggleGroupItem value="card" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>

              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}
      {layout === "card" ? (
        <div className="grid gap-6">
          {filteredStaff.map((member: any) => (
            <Card
              key={member.id}
              className={member.archived ? "opacity-60" : ""}
            >
              <CardContent className="px-6 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={`/placeholder.svg?height=64&width=64&query=${member.name} coach`}
                      />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xl">{member.name}</h3>
                        {member.archived && (
                          <Badge variant="outline" className="text-xs">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{member.role}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {member.specialties.map((specialty: string) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {member.schedule}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {member.classes} classes today
                    </div>
                    <div className="text-sm font-medium">{`$${member.hourlyRate}/hour`}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaffMember(member);
                          setSelectedDate(new Date());
                          setViewMode("month");
                          setLevelFilter("All");
                          setIsScheduleOpen(true);
                        }}
                      >
                        View Schedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaffMember(member);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {member.archived ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unarchiveStaff(member.id)}
                        >
                          Unarchive
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveStaff(member.id)}
                        >
                          Archive
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStaff(member.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-auto rounded border">
          <table className="w-full min-w-[700px] table-auto">
            <thead className="bg-muted-foreground/5">
              <tr className="text-left text-sm">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Specialties</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Classes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStaff.map((member: any) => (
                <tr
                  key={member.id}
                  className={
                    "align-top " + (member.archived ? "opacity-60" : "")
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40&query=${member.name} coach`}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">{member.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {(member.specialties || []).join(", ")}
                  </td>
                  <td className="px-4 py-3">{`$${member.hourlyRate}`}</td>
                  <td className="px-4 py-3">{member.classes}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaffMember(member);
                          setSelectedDate(new Date());
                          setViewMode("month");
                          setLevelFilter("All");
                          setIsScheduleOpen(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaffMember(member);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {member.archived ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unarchiveStaff(member.id)}
                        >
                          Unarchive
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveStaff(member.id)}
                        >
                          Archive
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStaff(member.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <StaffScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        selectedStaffMember={selectedStaffMember}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        classes={classes}
      />
      <EditStaffDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        staffMember={selectedStaffMember}
      />
    </div>
  );
}
