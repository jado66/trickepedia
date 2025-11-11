export type ViewMode = "grid" | "list" | "table";
export type SortField =
  | "name"
  | "instructor"
  | "enrolled"
  | "capacity"
  | "location";
export type SortOrder = "asc" | "desc";

export interface CapacityStatus {
  color: "destructive" | "default" | "secondary";
  text: string;
}

export function getCapacityStatus(
  enrolled: number,
  capacity: number
): CapacityStatus {
  const percentage = (enrolled / capacity) * 100;
  if (percentage >= 100) return { color: "destructive", text: "Full" };
  if (percentage >= 80) return { color: "default", text: "Almost Full" };
  if (percentage >= 50) return { color: "secondary", text: "Available" };
  return { color: "secondary", text: "Open" };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function computeAge(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

export function getEnrollmentPercentage(
  enrolled: number,
  capacity: number
): number {
  return (enrolled / capacity) * 100;
}
