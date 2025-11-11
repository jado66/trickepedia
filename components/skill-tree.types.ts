export interface Trick {
  id: string;
  name: string;
  slug: string;
  prerequisite_ids: string[] | null;
  difficulty_level: number | null;
  subcategory?: {
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
}

export interface TrickNodeData {
  trick: Trick;
  completed: boolean;
  onToggle: (id: string) => void;
  categoryColor: string;
  isMobile: boolean;
}
