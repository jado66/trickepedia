import { Event } from "@/types/event";
import { geocodeAddress } from "../services/geocoding";
import { createServer } from "@/utils/supabase/server";
export async function getEventsByCategory(
  categorySlug: string
): Promise<Event[]> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("events")
    .select(
      `
      *,
      master_categories!inner(name, slug, color, move_name)
    `
    )
    .eq("master_categories.slug", categorySlug)
    .eq("master_categories.is_active", true)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }

  return data || [];
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("events")
    .select(
      `
      *,
      master_categories(name, slug, color, move_name)
    `
    )
    .eq("id", eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return data;
}
