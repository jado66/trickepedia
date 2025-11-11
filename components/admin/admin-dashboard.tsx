"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { UserGrowthChart, UserGrowthPoint } from "./user-growth-chart";
import { useToast } from "@/hooks/use-toast";
import { UsersTable, UserRow, UserRole } from "./users-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Default page size; now user-adjustable in the table UI
const DEFAULT_ITEMS_PER_PAGE = 10;

export function AdminDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingXP, setUpdatingXP] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [sortingState, setSortingState] = useState<{
    column: string;
    direction: "asc" | "desc" | null;
  }>({ column: "created_at", direction: "desc" });
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);
  const [loadingGrowth, setLoadingGrowth] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("users").select("*", { count: "exact" });

      // Sorting (server-side)
      if (sortingState.column && sortingState.direction) {
        query = query.order(sortingState.column, {
          ascending: sortingState.direction === "asc",
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
        );
      }

      // Apply role filter
      if (roleFilter !== "all") {
        query = query.eq("role", roleFilter);
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalUsers(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, currentPage, sortingState, pageSize]);
  const updateUserXP = async (userId: string, newXP: number) => {
    setUpdatingXP(userId);
    try {
      const { error } = await supabase
        .from("users")
        .update({ xp: newXP })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, xp: newXP } : u))
      );

      toast({ title: "XP Updated", description: `Set XP to ${newXP}` });
    } catch (error) {
      console.error("Error updating user XP", error);
      toast({
        title: "Error",
        description: "Failed to update XP",
        variant: "destructive",
      });
    } finally {
      setUpdatingXP(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdatingRole(userId);
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete from auth (this will cascade to the users table if RLS is set up correctly)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(
          `Failed to delete user from auth: ${authError.message}`
        );
      }

      // If auth deletion succeeded, also delete from users table as backup
      // (in case RLS doesn't handle the cascade)
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      // We don't throw on dbError since the auth deletion is the primary concern
      // The user record might already be deleted by RLS cascade
      if (dbError) {
        console.warn(
          "Error deleting from users table (may already be deleted by cascade):",
          dbError
        );
      }

      setUsers(users.filter((user) => user.id !== userId));
      setTotalUsers(totalUsers - 1);

      toast({
        title: "Success",
        description: "User deleted successfully from both auth and database",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch all user creation timestamps (paged) once for growth chart
  useEffect(() => {
    let isCancelled = false;
    async function fetchGrowth() {
      setLoadingGrowth(true);
      try {
        // First request just to get count
        const pageSize = 1000;
        const initial = await supabase
          .from("users")
          .select("id, created_at", { count: "exact" })
          .order("created_at", { ascending: true })
          .range(0, pageSize - 1);

        if (initial.error) throw initial.error;
        const all: { id: string; created_at: string }[] = initial.data || [];
        const total = initial.count || all.length;

        // If more than first page, loop
        for (let offset = pageSize; offset < total; offset += pageSize) {
          const { data, error } = await supabase
            .from("users")
            .select("id, created_at")
            .order("created_at", { ascending: true })
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          if (data) all.push(...data);
        }

        if (isCancelled) return;

        // Aggregate by day
        const byDay: Record<string, number> = {};
        all.forEach((u) => {
          if (!u.created_at) return;
          const day = new Date(u.created_at).toISOString().split("T")[0];
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - ensure numeric increment
          byDay[day] = (byDay[day] || 0) + 1;
        });
        const sortedDays = Object.keys(byDay).sort();
        let cumulative = 0;
        const points: UserGrowthPoint[] = sortedDays.map((day) => {
          const daily = byDay[day];
          cumulative += daily;
          return { date: day, daily, cumulative };
        });
        setGrowthData(points);
      } catch (e) {
        console.error("Error fetching user growth data", e);
      } finally {
        if (!isCancelled) setLoadingGrowth(false);
      }
    }
    fetchGrowth();
    return () => {
      isCancelled = true;
    };
  }, []);

  const totalPages = Math.ceil(totalUsers / pageSize) || 1;

  // Adapter to pass to UsersTable (1-based to 0-based conversion done there if needed)
  const handleFetchPage = ({
    pageIndex,
    pageSize: incomingPageSize,
    sorting,
  }: any) => {
    // Update state that triggers effect
    setCurrentPage(pageIndex + 1);
    if (incomingPageSize && incomingPageSize !== pageSize) {
      setPageSize(incomingPageSize);
      setCurrentPage(1); // reset to first page when size changes
    }
    if (sorting && sorting[0]) {
      const { id, desc } = sorting[0];
      setSortingState({ column: id, direction: desc ? "desc" : "asc" });
    } else if (sorting?.length === 0) {
      setSortingState({ column: "created_at", direction: "desc" });
    }
    // search + role already managed via controlled states
  };

  return (
    <div className="min-h-screen bg-background lg:p-6 p-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {totalUsers} total users
          </div>
        </div>
        {/* User Growth Chart */}
        <UserGrowthChart data={growthData} isLoading={loadingGrowth} />
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Enhanced management table with sorting, column visibility &
              actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable
              data={users}
              pageCount={totalPages}
              totalUsers={totalUsers}
              isLoading={loading}
              onDelete={(id) => setPendingDeleteId(id)}
              onRoleChange={updateUserRole}
              onXPChange={updateUserXP}
              updatingXPId={updatingXP}
              fetchPage={handleFetchPage}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              globalFilter={searchTerm}
              setGlobalFilter={setSearchTerm}
              updatingRoleId={updatingRole}
            />
          </CardContent>
        </Card>

        <AlertDialog
          open={!!pendingDeleteId}
          onOpenChange={(open) => !open && setPendingDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (pendingDeleteId) deleteUser(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
