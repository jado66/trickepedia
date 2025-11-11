export interface Trick {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty_level: number | null;
  subcategory_id?: string | null;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
    master_category?: {
      name: string;
      slug: string;
      color: string | null;
    };
  };
}

export interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon_name: string | null;
  move_name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  master_category_id: string;
}

export interface TrickFormData {
  name: string;
  description: string;
  difficulty_level: number;
  subcategory_id: string;
  // Unified media input; classify into image_urls or video_urls on save
  media_url?: string;
}
