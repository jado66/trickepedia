"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce"; // ensure or create hook; fallback inline if missing
import { cn } from "@/lib/utils";

export type UserRole = "user" | "business" | "administrator" | "moderator";

export interface UserRow {
  id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  profile_image_url: string | null;
  created_at: string;
  phone: string | null;
  referrals?: number;
  xp?: number;
}

interface UsersTableProps {
  data: UserRow[];
  pageCount: number; // server-side total pages
  totalUsers: number;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onRoleChange: (id: string, role: UserRole) => void;
  fetchPage: (opts: {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    globalFilter: string;
    roleFilter: UserRole | "all";
  }) => void;
  currentPage: number; // 1-based
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  roleFilter: UserRole | "all";
  setRoleFilter: (r: UserRole | "all") => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  updatingRoleId?: string | null;
  onXPChange?: (id: string, xp: number) => void;
  updatingXPId?: string | null;
}

const DEFAULT_PAGE_SIZE = 10;

export function UsersTable(props: UsersTableProps) {
  const {
    data,
    pageCount,
    totalUsers,
    isLoading,
    onDelete,
    onRoleChange,
    fetchPage,
    currentPage,
    pageSize = DEFAULT_PAGE_SIZE,
    onPageSizeChange,
    roleFilter,
    setRoleFilter,
    globalFilter,
    setGlobalFilter,
    updatingRoleId,
    onXPChange,
    updatingXPId,
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // reserved for future column-specific filters
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Debounce global search input to avoid spamming network
  const debouncedGlobal = useDebounce(globalFilter, 300);

  React.useEffect(() => {
    fetchPage({
      pageIndex: currentPage - 1,
      pageSize,
      sorting,
      globalFilter: debouncedGlobal,
      roleFilter,
    });
  }, [sorting, debouncedGlobal, roleFilter, currentPage, pageSize]);

  const columns = React.useMemo<ColumnDef<UserRow, any>[]>(
    () => [
      {
        accessorKey: "profile_image_url",
        header: () => <span />,
        cell: ({ row }) => {
          const user = row.original;
          const initials =
            (user.first_name?.[0] || user.email[0]) +
            (user.last_name?.[0] || "");
          return (
            <Avatar className="size-8">
              <AvatarImage src={user.profile_image_url || undefined} />
              <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
          );
        },
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: "username",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-2"
          >
            Name / Username <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const u = row.original;
          const name =
            u.first_name && u.last_name
              ? `${u.first_name} ${u.last_name}`
              : u.username || "—";
          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground leading-none">
                {name}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {u.email}
              </span>
            </div>
          );
        },
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-2"
          >
            Role <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          const variant =
            user.role === "administrator"
              ? "destructive"
              : user.role === "business"
              ? "default"
              : "secondary";
          return (
            <Select
              value={user.role}
              disabled={updatingRoleId === user.id}
              onValueChange={(v: UserRole) => onRoleChange(user.id, v)}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "phone",
        header: () => <span>Phone</span>,
        cell: ({ row }) =>
          row.original.phone || (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "referrals",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-2"
          >
            Referrals <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => row.original.referrals ?? 0,
      },
      {
        accessorKey: "xp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-2"
          >
            XP <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <InlineXPCell
              user={user}
              disabled={!!updatingXPId && updatingXPId === user.id}
              saving={updatingXPId === user.id}
              onSave={(val) => onXPChange && onXPChange(user.id, val)}
            />
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-2"
          >
            Joined <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
      },
    ],
    [onDelete, onRoleChange, updatingRoleId]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    debugTable: false,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-72"
          />
          <Select
            value={roleFilter}
            onValueChange={(v: UserRole | "all") => setRoleFilter(v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="administrator">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    className="capitalize"
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}
        </div>
        <div className="flex items-center gap-2">
          {onPageSizeChange && (
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fetchPage({
                pageIndex: currentPage - 2,
                pageSize,
                sorting,
                globalFilter,
                roleFilter,
              })
            }
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <div className="text-xs text-muted-foreground">
            Page {currentPage} / {pageCount || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fetchPage({
                pageIndex: currentPage,
                pageSize,
                sorting,
                globalFilter,
                roleFilter,
              })
            }
            disabled={currentPage === pageCount || isLoading || pageCount === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

interface InlineXPCellProps {
  user: UserRow;
  onSave: (value: number) => void;
  disabled?: boolean;
  saving?: boolean;
}

const InlineXPCell: React.FC<InlineXPCellProps> = ({
  user,
  onSave,
  disabled,
  saving,
}) => {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState<number>(user.xp ?? 0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Keep value in sync if external xp changes and not currently editing
  React.useEffect(() => {
    if (!editing) setValue(user.xp ?? 0);
  }, [user.xp, editing]);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const normalized = Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : 0;
    if (normalized !== (user.xp ?? 0)) {
      onSave(normalized);
    }
    setEditing(false);
  };

  const cancel = () => {
    setValue(user.xp ?? 0);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type="number"
          min={0}
          className="h-7 w-20 px-2"
          value={value}
          disabled={disabled}
          onChange={(e) =>
            setValue(e.target.value === "" ? 0 : Number(e.target.value))
          }
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
            } else if (e.key === "Escape") {
              cancel();
            }
          }}
        />
        {saving && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setEditing(true)}
      className={cn(
        "text-left text-sm tabular-nums",
        disabled && "opacity-50 cursor-not-allowed",
        "hover:underline"
      )}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        (user.xp ?? 0).toLocaleString()
      )}
    </button>
  );
};
