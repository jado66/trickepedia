// types/trick.ts

export interface Trick {
  id: string;
  subcategory_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  difficulty_level: number | null;
  step_by_step_guide: Record<string, any>[] | null;
  tips_and_tricks: string | null;
  common_mistakes: string | null;
  safety_notes: string | null;
  video_urls: string[] | null;
  image_urls: string[] | null;
  tags: string[] | null;
  view_count: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  inventor_user_id: string | null;
  inventor_name: string | null;
  source_urls: string[] | null;
  parent_id: string | null;
  is_combo: boolean;
  is_promoted: boolean;
  trick_details: Record<string, any> | null;
  prerequisite_ids: string[];
  search_text?: string;
  components?: Array<{
    id?: string;
    component_trick_id: string;
    sequence: number;
    component_details: Record<string, any>;
  }>;
  // Joined data
  subcategory?: {
    name: string;
    slug: string;
    master_category: {
      name: string;
      slug: string;
      color: string | null;
    };
  };

  inventor?: {
    first_name: string;
    last_name: string;
    username?: string | null;
    profile_image_url?: string | null;
  };
}
export interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email?: string;
}

export interface TrickData {
  // ... existing
  id?: string;
  subcategory_id?: string | null;
  name: string;
  slug?: string;
  description: string;
  difficulty_level: number;
  step_by_step_guide?: Record<string, any>[];
  tips_and_tricks?: string;
  common_mistakes?: string;
  safety_notes?: string;
  video_urls?: string[];
  image_urls?: string[];
  tags?: string[];
  source_urls?: string[];
  view_count?: number;
  is_published?: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  inventor_user_id?: string | null;
  inventor_name?: string | null;
  parent_id?: string;
  is_combo?: boolean;
  prerequisite_ids?: string[];
  is_promoted?: boolean;
  trick_details?: Record<string, any>;
  components?: Array<{
    id?: string;
    component_trick_id: string;
    sequence: number;
    component_details: Record<string, any>;
  }>;
}

export interface TrickFormProps {
  mode: "view" | "edit";
  trick: TrickData;
  onSubmit?: (data: TrickData) => void;
  loading?: boolean;
  users?: User[]; // Available users for inventor selection
}

// Database insert/update types
export interface TrickInsert {
  subcategory_id?: string | null;
  name: string;
  slug: string;
  description: string;
  difficulty_level: number;
  step_by_step_guide?: Record<string, any>[];
  tips_and_tricks?: string;
  common_mistakes?: string;
  safety_notes?: string;
  video_urls?: string[];
  image_urls?: string[];
  tags?: string[];
  source_urls?: string[];
  is_published?: boolean;
  inventor_user_id?: string | null;
  inventor_name?: string | null;
  parent_id?: string | null;
  is_combo?: boolean;
  is_promoted?: boolean;
  trick_details?: Record<string, any>;
  prerequisite_ids?: string[];
}

export interface TrickUpdate {
  name?: string;
  slug?: string;
  description?: string;
  difficulty_level?: number;
  step_by_step_guide?: Record<string, any>[];
  tips_and_tricks?: string;
  common_mistakes?: string;
  safety_notes?: string;
  video_urls?: string[];
  image_urls?: string[];
  tags?: string[];
  source_urls?: string[];
  is_published?: boolean;
  inventor_user_id?: string | null;
  inventor_name?: string | null;
  parent_id?: string | null;
  is_combo?: boolean;
  is_promoted?: boolean;
  trick_details?: Record<string, any>;
  prerequisite_ids?: string[];
  updated_at?: string | null;
}

// Utility types for inventor handling
export type InventorType = "none" | "user" | "name";

export interface TrickWithInventor extends TrickData {
  inventor_user?: User; // Populated when inventor_user_id is set
}

// Query types for API
export interface GetTricksParams {
  subcategory_id?: string;
  difficulty_min?: number;
  difficulty_max?: number;
  tags?: string[];
  search?: string;
  inventor_user_id?: string;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}

export interface PrerequisiteTrick {
  id: string;
  name: string;
  slug: string;
  subcategory: {
    slug: string;
    master_category: {
      slug: string;
    };
  };
}

// This type represents how we'll handle prerequisites internally
export type EnhancedPrerequisite = {
  text: string;
  linkedTrick?: PrerequisiteTrick;
};

// Add a helper type for the API response
export interface TrickWithLinkedPrerequisites extends Trick {
  prerequisite_tricks?: PrerequisiteTrick[];
}
