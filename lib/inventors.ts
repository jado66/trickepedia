// utils/inventor.ts

import type { User, TrickData, InventorType } from "@/types/trick";

/**
 * Get the display name for a trick's inventor
 */
export function getInventorDisplayName(
  trick: TrickData,
  users: User[] = []
): string | null {
  if (trick.inventor_user_id && users.length > 0) {
    const user = users.find((u) => u.id === trick.inventor_user_id);
    if (user) {
      return user.username || `${user.first_name} ${user.last_name}`;
    }
    return "Unknown User";
  }
  return trick.inventor_name || null;
}

/**
 * Determine the inventor type based on trick data
 */
export function getInventorType(trick: TrickData): InventorType {
  if (trick.inventor_user_id) return "user";
  if (trick.inventor_name) return "name";
  return "none";
}

/**
 * Validate inventor data before saving
 */
export function validateInventorData(
  inventorType: InventorType,
  inventorUserId: string | null,
  inventorName: string | null
): { isValid: boolean; error?: string } {
  switch (inventorType) {
    case "user":
      if (!inventorUserId) {
        return {
          isValid: false,
          error: "Please select a user when choosing 'Select registered user'",
        };
      }
      break;
    case "name":
      if (!inventorName?.trim()) {
        return {
          isValid: false,
          error:
            "Please enter an inventor name when choosing 'Enter inventor name'",
        };
      }
      break;
    case "none":
      // No validation needed for none
      break;
  }
  return { isValid: true };
}

/**
 * Clean inventor data based on the selected type
 */
export function cleanInventorData(
  inventorType: InventorType,
  inventorUserId: string | null,
  inventorName: string | null
): { inventor_user_id: string | null; inventor_name: string | null } {
  switch (inventorType) {
    case "user":
      return { inventor_user_id: inventorUserId, inventor_name: null };
    case "name":
      return {
        inventor_user_id: null,
        inventor_name: inventorName?.trim() || null,
      };
    case "none":
    default:
      return { inventor_user_id: null, inventor_name: null };
  }
}

/**
 * Search tricks by inventor
 */
export function filterTricksByInventor(
  tricks: TrickData[],
  searchTerm: string,
  users: User[] = []
): TrickData[] {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return tricks.filter((trick) => {
    // Check inventor name
    if (trick.inventor_name?.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }

    // Check inventor user
    if (trick.inventor_user_id && users.length > 0) {
      const user = users.find((u) => u.id === trick.inventor_user_id);
      if (user) {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const username = user.username?.toLowerCase() || "";

        return (
          fullName.includes(lowerSearchTerm) ||
          username.includes(lowerSearchTerm)
        );
      }
    }

    return false;
  });
}

/**
 * Get all unique inventors from a list of tricks
 */
export function getUniqueInventors(
  tricks: TrickData[],
  users: User[] = []
): Array<{ type: "user" | "name"; id?: string; name: string }> {
  const inventorMap = new Map<
    string,
    { type: "user" | "name"; id?: string; name: string }
  >();

  tricks.forEach((trick) => {
    if (trick.inventor_user_id) {
      const user = users.find((u) => u.id === trick.inventor_user_id);
      if (user) {
        const name = user.username || `${user.first_name} ${user.last_name}`;
        inventorMap.set(`user-${user.id}`, {
          type: "user",
          id: user.id,
          name,
        });
      }
    } else if (trick.inventor_name) {
      inventorMap.set(`name-${trick.inventor_name}`, {
        type: "name",
        name: trick.inventor_name,
      });
    }
  });

  return Array.from(inventorMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Get tricks by specific inventor
 */
export function getTricksByInventor(
  tricks: TrickData[],
  inventorType: "user" | "name",
  inventorId: string
): TrickData[] {
  return tricks.filter((trick) => {
    if (inventorType === "user") {
      return trick.inventor_user_id === inventorId;
    } else {
      return trick.inventor_name === inventorId;
    }
  });
}
