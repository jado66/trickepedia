// Database types for the Flipside application

export type UserRole = "admin" | "moderator" | "user";

export type EventType = "meetup" | "class" | "competition" | "open_session";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DatabaseUser {
  id: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_image_url?: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  owner_id: string;
  sports: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  hub_id: string;
  organizer_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  max_participants?: number;
  skill_level?: string;
  sports: string[];
  created_at: string;
  updated_at: string;
}

export interface UserHubSchedule {
  id: string;
  user_id: string;
  hub_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trick_count?: number;
  move_name?: string | null;
  status?: "active" | "inactive" | "hidden";
}
