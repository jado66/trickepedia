export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional"
  | "elite";
export type AthleteStatus = "active" | "retired" | "inactive";

export type SocialMediaPlatform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "twitch"
  | "discord"
  | "website"
  | "other";

export interface SocialLink {
  platform: SocialMediaPlatform;
  url: string;
  label?: string; // Optional label for "other" or multiple accounts
}

export interface Athlete {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  sport_category_ids?: string[];
  sport_categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  status: AthleteStatus;
  years_experience?: number;
  country?: string;
  city?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  stance?: string;
  social_links?: SocialLink[];
  notable_achievements?: string;
  signature_trick_ids?: string[];
  signature_tricks?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sponsors?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}
