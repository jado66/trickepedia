import { createServer } from "@/utils/supabase/server";
import { TrickipediaLayoutClient } from "./TrickipediaLayoutClient";
import type { NavigationCategory } from "@/components/side-nav/types";

export const revalidate = 60;

async function getNavigationData(): Promise<NavigationCategory[]> {
  const supabase = createServer();

  try {
    const { data, error } = await supabase
      .from("master_categories")
      .select(
        `
        id,
        name,
        slug,
        icon_name,
        color,
        sort_order,
        status,
        subcategories(
          id,
          name,
          slug,
          sort_order,
          tricks(
            id,
            name,
            slug,
            difficulty_level,
            is_published
          )
        )
      `
      )

      .eq("subcategories.is_active", true)
      .order("sort_order")
      .order("sort_order", { foreignTable: "subcategories" })
      .order("difficulty_level", { foreignTable: "subcategories.tricks" });

    if (error) {
      console.error("Error fetching navigation data:", error);
      return [];
    }

    // Transform the data
    const transformedCategories: NavigationCategory[] = (data || []).map(
      (category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon_name: category.icon_name,
        color: category.color,
        sort_order: category.sort_order,
        status: category.status,
        subcategories: (category.subcategories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          sort_order: sub.sort_order,
          tricks: (sub.tricks || [])
            .filter((trick: any) => trick.is_published)
            .sort(
              (a: any, b: any) =>
                (a.difficulty_level || 0) - (b.difficulty_level || 0)
            )
            .map((trick: any) => ({
              id: trick.id,
              name: trick.name,
              slug: trick.slug,
            })),
          tricksLoaded: true,
          tricksLoading: false,
        })),
        subcategoriesLoaded: true,
        subcategoriesLoading: false,
      })
    );

    return transformedCategories;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isFetchError =
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("ECONNREFUSED");

    console.error("Error fetching navigation data:", {
      message: errorMessage,
      details: error instanceof Error ? error.stack : error,
      hint: isFetchError
        ? "⚠️  VPN ISSUE? If you're connected to a VPN, try disconnecting it. VPNs can block Supabase connections."
        : "",
      code: (error as any)?.code || "",
    });

    if (isFetchError && process.env.NODE_ENV === "development") {
      console.log("\n🚨 CONNECTION ERROR DETECTED 🚨");
      console.log("💡 Common causes:");
      console.log("   1. VPN is blocking Supabase connection (most common)");
      console.log("   2. Firewall or antivirus blocking requests");
      console.log("   3. Network connectivity issues");
      console.log("   4. Supabase instance is down\n");
    }

    return [];
  }
}

// Server component - only fetch navigation data, no auth checks
export async function TrickipediaLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationData = await getNavigationData();

  // Don't try to get user in server component - let client handle it
  return (
    <TrickipediaLayoutClient initialNavigationData={navigationData}>
      {children}
    </TrickipediaLayoutClient>
  );
}
