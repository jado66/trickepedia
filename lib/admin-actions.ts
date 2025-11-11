import type { DatabaseUser, UserRole } from "@/lib/types/database";
import { createServer } from "@/utils/supabase/server";
export type User = DatabaseUser;
export type { UserRole };

export async function getUsers(): Promise<User[]> {
  const supabase = createServer();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return data || [];
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void> {
  const supabase = createServer();
  const { error } = await supabase
    .from("users")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
}

export async function updateMultipleUserRoles(
  userIds: string[],
  newRole: UserRole
): Promise<void> {
  const supabaseServer = createServer();
  const { error } = await supabaseServer
    .from("users")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .in("id", userIds);

  if (error) {
    console.error("Error updating user roles:", error);
    throw new Error("Failed to update user roles");
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

export async function searchUsers(
  searchTerm: string,
  roleFilter?: UserRole
): Promise<User[]> {
  const supabase = createServer();
  let query = supabase.from("users").select("*");

  if (searchTerm) {
    query = query.or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    );
  }

  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error searching users:", error);
    throw new Error("Failed to search users");
  }

  return data || [];
}

export function getRoleStats(users: User[]) {
  const stats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: users.length,
    admin: stats.admin || 0,
    moderator: stats.moderator || 0,
    user: stats.user || 0,
  };
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
