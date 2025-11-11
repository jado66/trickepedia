// Types for navigation data
export interface NavigationTrick {
  id: string;
  name: string;
  slug: string;
}

export interface NavigationSubcategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  tricks?: NavigationTrick[];
  tricksLoaded?: boolean;
  tricksLoading?: boolean;
}

export interface NavigationCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  status?: string;
  subcategories?: NavigationSubcategory[];
  subcategoriesLoaded?: boolean;
  subcategoriesLoading?: boolean;
}
