"use client";

import React, { useState, useMemo } from "react";

import { useGym } from "@/contexts/gym/gym-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/use-local-storage";
// Lightweight inline membership plan editor (avoids separate page)
import { MembershipPlans } from "@/components/gym-management/membership-plans";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Mail,
  Phone,
  Users,
  CreditCard,
} from "lucide-react";
import Fuse from "fuse.js";
import { useWaivers } from "@/contexts/waivers/waiver-provider";

interface MemberBasic {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  ageYears?: number;
  membershipType: string;
  status: string;
  joinDate: string;
  lastVisit: string;
  emergencyContact: string;
  medicalNotes: string;
  avatar?: string;
}

// Stable defaults (avoid recreating objects each render which caused localStorage hook effect loops)
const MEMBER_TABLE_DEFAULT_STATE: {
  sorting: SortingState;
  columnVisibility: Record<string, boolean>;
  pageSize: number;
} = Object.freeze({
  sorting: [] as SortingState,
  columnVisibility: {} as Record<string, boolean>,
  pageSize: 25,
});

type WaiverFilter = "all" | "active" | "expired" | "expiringSoon" | "none";
interface MemberFiltersState {
  membership: string; // "all" or plan name
  statuses: string[]; // selected statuses
  waiver: WaiverFilter;
}
const MEMBER_TABLE_DEFAULT_FILTERS: MemberFiltersState = Object.freeze({
  membership: "all",
  statuses: [],
  waiver: "all",
});

// small helper to compute age in years from ISO birth date
function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;
  try {
    const today = new Date();
    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return undefined;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  } catch {
    return undefined;
  }
}

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberBasic | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Persisted table state
  const [persistedState, setPersistedState] = useLocalStorage(
    "memberTableState",
    MEMBER_TABLE_DEFAULT_STATE
  );
  const [sorting, setSorting] = useState<SortingState>(
    persistedState.sorting || []
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(persistedState.columnVisibility || {});
  const [filters, setFilters] = useLocalStorage(
    "memberTableFilters",
    MEMBER_TABLE_DEFAULT_FILTERS
  );
  const {
    members,
    addMember,
    updateMember,
    removeMember,
    demoMode,
    limits,
    membershipPlans,
  } = useGym();
  const { getPrimaryWaiverStatus } = useWaivers();

  const fuse = useMemo(
    () =>
      new Fuse(members, {
        keys: ["name", "email", "membershipType"],
        threshold: 0.3,
      }),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim();
    let base: MemberBasic[];
    if (!query) {
      base = members as MemberBasic[];
    } else {
      base = fuse.search(query).map((r) => r.item as MemberBasic);
    }
    if (filters.membership !== "all") {
      base = base.filter((m) => m.membershipType === filters.membership);
    }
    if (filters.statuses.length > 0) {
      base = base.filter((m) => filters.statuses.includes(m.status));
    }
    if (filters.waiver !== "all") {
      base = base.filter(
        (m) => getPrimaryWaiverStatus(m.id).state === filters.waiver
      );
    }
    return base;
  }, [members, searchTerm, fuse, filters, getPrimaryWaiverStatus]);

  // Column Definitions (TanStack Table)
  const columns = useMemo<ColumnDef<MemberBasic>[]>(
    () => [
      {
        id: "avatar",
        header: "Avatar",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  member.avatar ||
                  `/placeholder.svg?height=32&width=32&query=${member.name}`
                }
                alt={member.name}
              />
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          );
        },
        size: 60,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium max-w-[180px] truncate">
            {row.original.name}
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground max-w-[200px]">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{row.original.phone}</span>
          </div>
        ),
      },
      {
        accessorKey: "membershipType",
        header: "Membership",
        cell: ({ row }) => (
          <Badge variant="secondary" className="max-w-[140px] truncate">
            {row.original.membershipType}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={`inline-flex items-center gap-1.5 ${getStatusColor(
              row.original.status
            )}`}
          >
            {getStatusIcon(row.original.status)}
            <span className="capitalize">{row.original.status}</span>
          </Badge>
        ),
      },
      {
        accessorKey: "joinDate",
        header: "Join Date",
        cell: ({ row }) =>
          row.original.joinDate
            ? new Date(row.original.joinDate).toLocaleDateString()
            : "—",
      },
      {
        accessorKey: "lastVisit",
        header: "Last Visit",
        cell: ({ row }) => row.original.lastVisit || "—",
      },
      {
        id: "waiver",
        header: "Waiver",
        cell: ({ row }) => {
          const waiverStatus = getPrimaryWaiverStatus(row.original.id);
          const waiverBadgeStyle =
            {
              none: "bg-red-100 text-red-700",
              expired: "bg-red-100 text-red-700",
              expiringSoon: "bg-amber-100 text-amber-800",
              active: "bg-green-100 text-green-700",
            }[waiverStatus.state as any] || "bg-gray-100 text-gray-700";
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${waiverBadgeStyle}`}
            >
              {waiverStatus.label}
            </span>
          );
        },
      },
      {
        id: "age",
        header: "Age",
        cell: ({ row }) => {
          const member = row.original;
          const age =
            (member as MemberBasic).ageYears ??
            (member.birthDate ? calculateAge(member.birthDate) : undefined);
          return (
            <span className="text-sm">{age != null ? `${age} yrs` : "—"}</span>
          );
        },
        size: 60,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(row.original as MemberBasic);
                setIsEditDialogOpen(true);
              }}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeMember(row.original.id);
              }}
            >
              Remove
            </Button>
          </div>
        ),
        size: 120,
        enableHiding: false,
      },
    ],
    [removeMember, getPrimaryWaiverStatus]
  );

  const table = useReactTable({
    data: filteredMembers,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((old) =>
        typeof updater === "function" ? updater(old) : updater
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: persistedState.pageSize || 25 },
    },
    enableMultiSort: true,
  });

  // Reset to first page on search term change
  React.useEffect(() => {
    table.setPageIndex(0);
  }, [searchTerm, filters, table]);

  React.useEffect(() => {
    const pageSize = table.getState().pagination.pageSize;
    // Shallow compare to avoid unnecessary state sets
    if (
      persistedState.pageSize === pageSize &&
      JSON.stringify(persistedState.sorting) === JSON.stringify(sorting) &&
      JSON.stringify(persistedState.columnVisibility) ===
        JSON.stringify(columnVisibility)
    ) {
      return;
    }
    setPersistedState({ sorting, columnVisibility, pageSize });
  }, [sorting, columnVisibility, table, persistedState]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
        return <Clock className="h-3 w-3" />;
      case "suspended":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleAddMember = async (formData: FormData) => {
    const res = await addMember({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      membershipType: formData.get("membershipType") as string,
      status: "active",
      emergencyContact: formData.get("emergencyContact") as string,
      medicalNotes: (formData.get("medicalNotes") as string) || "",
      avatar: undefined,
    });
    if (!res.success) return alert(res.error);
    setIsAddDialogOpen(false);
  };

  const handleEditMember = async (formData: FormData) => {
    if (!selectedMember) return;

    const status = formData.get("status") as string;
    const validStatus = ["active", "inactive", "suspended"].includes(status)
      ? (status as "active" | "inactive" | "suspended")
      : "active";

    const res = await updateMember(selectedMember.id, {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      membershipType: formData.get("membershipType") as string,
      status: validStatus,
      emergencyContact: formData.get("emergencyContact") as string,
      birthDate: (formData.get("birthDate") as string) || undefined,
      medicalNotes: (formData.get("medicalNotes") as string) || "",
    });

    if (!res.success) return alert(res.error);
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <Tabs defaultValue="members" className="space-y-6">
      <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex gap-2 p-1 bg-muted/50 rounded-lg shadow-sm">
        <TabsTrigger
          value="members"
          aria-label="Members"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
          <span className="sm:hidden">Members</span>
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          aria-label="Membership Plans"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Membership Plans</span>
          <span className="sm:hidden">Plans</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="members" className="space-y-6">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3 flex-1 items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, membership..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.membership}
              onValueChange={(val) =>
                setFilters({ ...filters, membership: val })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {membershipPlans
                  .filter((p) => p.status === "active")
                  .map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Status
                  {filters.statuses.length > 0 && (
                    <span className="ml-2 text-xs opacity-70">
                      {filters.statuses.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                  ["suspended", "Suspended"],
                ].map(([v, l]) => {
                  const checked = filters.statuses.includes(v);
                  return (
                    <DropdownMenuCheckboxItem
                      key={v}
                      checked={checked}
                      onCheckedChange={(c) => {
                        setFilters({
                          ...filters,
                          statuses: c
                            ? [...filters.statuses, v]
                            : filters.statuses.filter((s) => s !== v),
                        });
                      }}
                    >
                      {l}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Select
              value={filters.waiver}
              onValueChange={(v: any) => setFilters({ ...filters, waiver: v })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Waiver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Waivers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiringSoon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => {
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 max-h-72 overflow-auto"
              >
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(c) => col.toggleVisibility(!!c)}
                      className="capitalize"
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilters({ membership: "all", statuses: [], waiver: "all" });
                setSorting([]);
                table.resetColumnVisibility();
                table.setPageIndex(0);
              }}
            >
              Reset
            </Button>
          </div>
          <div className="flex justify-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={demoMode && members.length >= limits.members}>
                  <Plus className="h-4 w-4 mr-2" />
                  {demoMode && members.length >= limits.members
                    ? "Demo Limit"
                    : "Add Member"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Create a new member profile with contact and membership
                    info.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="membershipType">Membership Type</Label>
                      <Select name="membershipType" required>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              membershipPlans.length
                                ? "Select membership"
                                : "Add plans first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {membershipPlans
                            .filter((p) => p.status === "active")
                            .map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input id="birthDate" name="birthDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      placeholder="Name - Phone Number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalNotes">Medical Notes</Label>
                    <Textarea
                      id="medicalNotes"
                      name="medicalNotes"
                      placeholder="Any medical conditions, allergies, or notes..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Member</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortedIndex = sorting.findIndex(
                      (s) => s.id === header.column.id
                    );
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.id === "avatar"
                            ? "w-[60px]"
                            : header.column.id === "age"
                            ? "w-[60px]"
                            : header.column.id === "actions"
                            ? "text-right"
                            : undefined
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:underline font-medium"
                            title={
                              isSorted
                                ? `Sorted ${header.column.getIsSorted()} (shift+click to multi-sort)`
                                : "Click to sort. Shift+Click to multi-sort"
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <span className="inline-flex items-center gap-0.5">
                              <ArrowUpDown
                                className={`h-3 w-3 transition-opacity ${
                                  isSorted ? "opacity-100" : "opacity-30"
                                }`}
                              />
                              {sortedIndex > -1 && sorting.length > 1 && (
                                <span className="text-[10px] font-semibold bg-muted px-1 rounded">
                                  {sortedIndex + 1}
                                </span>
                              )}
                            </span>
                          </button>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="text-muted-foreground">
                      {searchTerm
                        ? "No members found matching your search."
                        : "No members yet. Add your first member to get started."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedMember(row.original as MemberBasic);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === "actions"
                            ? "text-right"
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-muted-foreground">
          <div>
            {(() => {
              const total = filteredMembers.length;
              const pageIndex = table.getState().pagination.pageIndex;
              const pageSize = table.getState().pagination.pageSize;
              const start = total === 0 ? 0 : pageIndex * pageSize + 1;
              const end =
                pageIndex * pageSize + table.getRowModel().rows.length;
              return (
                <>
                  Showing {start}–{end} of {total}
                  {searchTerm && (
                    <span className="ml-1">
                      (filtered from {members.length})
                    </span>
                  )}
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Prev
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </Button>
          </div>
        </div>
        {/* Member Details Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
              <DialogDescription>
                View and edit member information
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <form action={handleEditMember}>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile" type="button">
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="membership" type="button">
                      Membership
                    </TabsTrigger>
                    <TabsTrigger value="activity" type="button">
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="waivers" type="button">
                      Waivers
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input
                          id="edit-name"
                          name="name"
                          defaultValue={selectedMember.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          name="email"
                          type="email"
                          defaultValue={selectedMember.email}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          name="phone"
                          defaultValue={selectedMember.phone}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-membershipType">
                          Membership Type
                        </Label>
                        <Select
                          name="membershipType"
                          defaultValue={selectedMember.membershipType}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {membershipPlans
                              .filter((p) => p.status === "active")
                              .map((p) => (
                                <SelectItem key={p.id} value={p.name}>
                                  {p.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        name="status"
                        defaultValue={selectedMember.status}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-birthDate">Birth Date</Label>
                      <Input
                        id="edit-birthDate"
                        name="birthDate"
                        type="date"
                        defaultValue={(selectedMember as any).birthDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency">Emergency Contact</Label>
                      <Input
                        id="edit-emergency"
                        name="emergencyContact"
                        defaultValue={selectedMember.emergencyContact}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-medical">Medical Notes</Label>
                      <Textarea
                        id="edit-medical"
                        name="medicalNotes"
                        defaultValue={selectedMember.medicalNotes}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="membership" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Current Membership
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">
                            {selectedMember.membershipType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Active since{" "}
                            {new Date(
                              selectedMember.joinDate
                            ).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Payment Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold text-green-600">
                            Current
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Next payment: Feb 15, 2024
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="activity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Recent Check-ins
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Advanced Tumbling</span>
                            <span className="text-muted-foreground">
                              Jan 25, 2024
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Open Gym</span>
                            <span className="text-muted-foreground">
                              Jan 23, 2024
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Strength Training</span>
                            <span className="text-muted-foreground">
                              Jan 20, 2024
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="waivers" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Waiver Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {(() => {
                          const ws = getPrimaryWaiverStatus(selectedMember.id);
                          return (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  {
                                    none: "bg-red-100 text-red-700",
                                    expired: "bg-red-100 text-red-700",
                                    expiringSoon: "bg-amber-100 text-amber-800",
                                    active: "bg-green-100 text-green-700",
                                  }[ws.state as any] ||
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {ws.label}
                              </span>
                              {ws.waiver?.expiresAt && (
                                <span className="text-muted-foreground">
                                  Expires{" "}
                                  {new Date(
                                    ws.waiver.expiresAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => alert("Launch waiver signing flow")}
                        >
                          Sign / Upload New Waiver
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>
      <TabsContent value="plans" className="space-y-4">
        <MembershipPlans />
      </TabsContent>
    </Tabs>
  );
}
