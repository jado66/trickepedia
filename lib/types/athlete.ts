export type AthleteStatus = "active" | "retired" | "injured" | "inactive";

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
  label?: string;
  follower_count?: number;
}

export interface TimelineSection {
  id: string;
  title: string;
  year?: string;
  date_range?: string;
  content: string;
  order: number;
}

export interface VideoEmbed {
  id: string;
  platform: "youtube" | "instagram";
  url: string;
  title?: string;
  thumbnail_url?: string;
}

export interface PrimaryCTA {
  text: string;
  url: string;
  platform?: SocialMediaPlatform;
}

export interface Athlete {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  status: AthleteStatus;
  years_experience?: number;
  country?: string;
  city?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  stance?: string;
  notable_achievements?: string;
  sponsors?: string[];
  social_links?: SocialLink[];
  signature_trick_ids?: string[];
  sport_category_ids?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;

  // New fields
  timeline_sections?: TimelineSection[];
  video_embeds?: VideoEmbed[];
  primary_cta?: PrimaryCTA;

  // Relations
  signature_tricks?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sport_categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}
