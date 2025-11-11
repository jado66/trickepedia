import { Event } from "@/types/event";
import { geocodeAddressWithFallback } from "../services/geocoding";

export async function getFeaturedEvents(supabaseClient: any): Promise<Event[]> {
  const { data, error } = await supabaseClient
    .from("events")
    .select(
      `
      *,
      master_categories(name, slug, color, move_name)
    `
    )
    .eq("is_featured", true)
    .eq("status", "upcoming")
    .order("start_date", { ascending: true })
    .limit(6);

  if (error) {
    console.error("Error fetching featured events:", error);
    return [];
  }

  return data || [];
}

export async function createEvent(
  supabaseClient: any,
  eventData: Omit<
    Event,
    | "id"
    | "created_at"
    | "updated_at"
    | "created_by"
    | "master_categories"
    | "latitude"
    | "longitude"
    | "geocoded_at"
  >
): Promise<Event> {
  // Normalize empty strings to null so Postgres date/time columns don't receive "" (causes 22007 errors)
  const sanitizedData: any = Object.fromEntries(
    Object.entries(eventData).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );

  // If event_type isn't 'other', drop custom_event_type
  if (sanitizedData.event_type !== "other") {
    sanitizedData.custom_event_type = null;
  }

  let geocodingData = {};
  if (sanitizedData.location_address) {
    console.log("Geocoding with context:", {
      address: sanitizedData.location_address,
      city: sanitizedData.location_city,
      state: sanitizedData.location_state,
      country: sanitizedData.location_country,
    });

    const geocodeResult = await geocodeAddressWithFallback(
      sanitizedData.location_address,
      sanitizedData.location_city,
      sanitizedData.location_state,
      sanitizedData.location_country
    );

    if (geocodeResult) {
      geocodingData = {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        geocoded_at: new Date().toISOString(),
      };
      console.log("Successfully geocoded to:", geocodeResult.display_name);
    } else {
      console.warn("Geocoding failed for:", sanitizedData.location_address);
    }
  }

  const { data, error } = await supabaseClient
    .from("events")
    .insert([{ ...sanitizedData, ...geocodingData }])
    .select(
      `
      *,
      master_categories(name, slug, color, move_name)
    `
    )
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }

  return data;
}

export async function updateEvent(
  supabaseClient: any,
  eventId: string,
  eventData: Partial<
    Omit<
      Event,
      | "id"
      | "created_at"
      | "updated_at"
      | "created_by"
      | "master_categories"
      | "latitude"
      | "longitude"
      | "geocoded_at"
    >
  >
): Promise<Event> {
  const sanitizedData: any = Object.fromEntries(
    Object.entries(eventData).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );

  if (sanitizedData.event_type && sanitizedData.event_type !== "other") {
    sanitizedData.custom_event_type = null;
  }

  let geocodingData = {};

  // Only re-geocode if the address or location fields have changed
  const locationFieldsChanged = [
    "location_address",
    "location_city",
    "location_state",
    "location_country",
  ].some((field) => field in sanitizedData);

  if (locationFieldsChanged && sanitizedData.location_address) {
    console.log("Location changed, re-geocoding with context:", {
      address: sanitizedData.location_address,
      city: sanitizedData.location_city,
      state: sanitizedData.location_state,
      country: sanitizedData.location_country,
    });

    const geocodeResult = await geocodeAddressWithFallback(
      sanitizedData.location_address,
      sanitizedData.location_city,
      sanitizedData.location_state,
      sanitizedData.location_country
    );

    if (geocodeResult) {
      geocodingData = {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        geocoded_at: new Date().toISOString(),
      };
      console.log("Successfully re-geocoded to:", geocodeResult.display_name);
    } else {
      console.warn("Re-geocoding failed for:", sanitizedData.location_address);
    }
  }

  const { data, error } = await supabaseClient
    .from("events")
    .update({
      ...sanitizedData,
      ...geocodingData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select(
      `
      *,
      master_categories(name, slug, color, move_name)
    `
    )
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }

  return data;
}

export async function deleteEvent(
  supabaseClient: any,
  eventId: string
): Promise<void> {
  const { error } = await supabaseClient
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}

export async function getEventsWithCoordinates(
  supabaseClient: any,
  categorySlug?: string
): Promise<Event[]> {
  let query = supabaseClient
    .from("events")
    .select(
      `
      *,
      master_categories(name, slug, color, move_name)
    `
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("start_date", { ascending: true });

  if (categorySlug) {
    query = query.eq("master_categories.slug", categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events with coordinates:", error);
    return [];
  }

  return data || [];
}
