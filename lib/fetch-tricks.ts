// ============================================================================
// API FUNCTIONS
// ============================================================================

import { supabase } from "@/utils/supabase/client";

/**
 * Fetch all master categories with counts
 */
export async function fetchMasterCategories() {
  try {
    const { data, error } = await supabase.rpc(
      "get_master_categories_with_counts"
    );

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching master categories:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Fetch subcategories by master category slug
 */
export async function fetchSubcategoriesByCategory(categorySlug) {
  try {
    if (!categorySlug) {
      throw new Error("Category slug is required");
    }

    const { data, error } = await supabase.rpc(
      "get_subcategories_by_category",
      {
        category_slug: categorySlug,
      }
    );

    if (error) {
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Fetch tricks by subcategory with pagination
 */
interface FetchTricksOptions {
  pageSize?: number;
  pageOffset?: number;
}

export async function fetchTricksBySubcategory(
  subcategorySlug: string,
  options: FetchTricksOptions = {}
) {
  try {
    if (!subcategorySlug) {
      throw new Error("Subcategory slug is required");
    }

    const { pageSize = 20, pageOffset = 0 } = options;

    const { data, error } = await supabase.rpc("get_tricks_by_subcategory", {
      subcategory_slug: subcategorySlug,
      page_size: pageSize,
      page_offset: pageOffset,
    });

    if (error) {
      throw new Error(`Failed to fetch tricks: ${error.message}`);
    }

    const totalCount = data && data.length > 0 ? data[0].total_count : 0;

    return {
      success: true,
      data: data || [],
      pagination: {
        totalCount,
        pageSize,
        pageOffset,
        hasNextPage: pageOffset + pageSize < totalCount,
        hasPreviousPage: pageOffset > 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching tricks by subcategory:", error);
    return {
      success: false,
      data: [],
      pagination: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Fetch single trick details by slug
 */
export async function fetchTrickDetails(trickSlug) {
  try {
    if (!trickSlug) {
      throw new Error("Trick slug is required");
    }

    const { data, error } = await supabase.rpc("get_trick_details", {
      trick_slug: trickSlug,
    });

    if (error) {
      throw new Error(`Failed to fetch trick details: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        data: null,
        error: "Trick not found",
      };
    }

    return {
      success: true,
      data: data[0],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching trick details:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Search tricks with filters and pagination
 */
interface SearchTricksOptions {
  query?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  difficultyMin?: number;
  difficultyMax?: number;
  pageSize?: number;
  pageOffset?: number;
}

export async function searchTricks(options: SearchTricksOptions = {}) {
  try {
    const {
      query = null,
      categorySlug = null,
      subcategorySlug = null,
      difficultyMin = 1,
      difficultyMax = 10,
      pageSize = 20,
      pageOffset = 0,
    } = options;

    const { data, error } = await supabase.rpc("search_tricks", {
      search_query: query,
      category_slug: categorySlug,
      subcategory_slug: subcategorySlug,
      difficulty_min: difficultyMin,
      difficulty_max: difficultyMax,
      page_size: pageSize,
      page_offset: pageOffset,
    });

    if (error) {
      throw new Error(`Failed to search tricks: ${error.message}`);
    }

    const totalCount = data && data.length > 0 ? data[0].total_count : 0;

    return {
      success: true,
      data: data || [],
      pagination: {
        totalCount,
        pageSize,
        pageOffset,
        hasNextPage: pageOffset + pageSize < totalCount,
        hasPreviousPage: pageOffset > 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error searching tricks:", error);
    return {
      success: false,
      data: [],
      pagination: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Increment trick view count
 */
export async function incrementTrickView(trickSlug) {
  try {
    if (!trickSlug) {
      throw new Error("Trick slug is required");
    }

    const { data, error } = await supabase.rpc("increment_trick_view", {
      trick_slug: trickSlug,
    });

    if (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      error: null,
    };
  } catch (error) {
    console.error("Error incrementing trick view:", error);
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example usage of the API functions
 */
export const exampleUsage = {
  // Fetch all categories for navigation
  async loadNavigation() {
    const categories = await fetchMasterCategories();
    if (categories.success) {
      console.log("Categories:", categories.data);
    }
  },

  // Load category page
  async loadCategoryPage(categorySlug) {
    const subcategories = await fetchSubcategoriesByCategory(categorySlug);
    if (subcategories.success) {
      console.log("Subcategories:", subcategories.data);
    }
  },

  // Load subcategory page with pagination
  async loadSubcategoryPage(subcategorySlug, page = 0) {
    const tricks = await fetchTricksBySubcategory(subcategorySlug, {
      pageSize: 12,
      pageOffset: page * 12,
    });
    if (tricks.success) {
      console.log("Tricks:", tricks.data);
      console.log("Pagination:", tricks.pagination);
    }
  },

  // Load trick detail page
  async loadTrickPage(trickSlug) {
    // Increment view count
    await incrementTrickView(trickSlug);

    // Fetch trick details
    const trick = await fetchTrickDetails(trickSlug);
    if (trick.success) {
      console.log("Trick:", trick.data);
    }
  },

  // Search functionality
  async performSearch(searchQuery, filters = {}) {
    const results = await searchTricks({
      query: searchQuery,
      ...filters,
      pageSize: 20,
      pageOffset: 0,
    });
    if (results.success) {
      console.log("Search results:", results.data);
      console.log(
        "Total found:",
        results.pagination ? results.pagination.totalCount : "Unknown"
      );
    }
  },
};
