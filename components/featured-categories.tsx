import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getNavigationData } from "@/lib/server/tricks-data-server";
import { iconMap } from "./side-nav/icon-map";

// Color mapping based on your database color values
const getColorClass = (color: string | null) => {
  if (!color) return "bg-primary";

  // Convert hex colors to Tailwind classes or use predefined mappings
  const colorMap: Record<string, string> = {
    "#3b82f6": "bg-blue-500",
    "#ef4444": "bg-red-500",
    "#10b981": "bg-green-500",
    "#f59e0b": "bg-yellow-500",
    "#8b5cf6": "bg-purple-500",
    "#06b6d4": "bg-cyan-500",
    // Add more color mappings as needed
  };

  return colorMap[color] || "bg-primary";
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  subcategories: Array<{
    tricks: Array<{ id: string }>;
  }>;
  trickCount: number; // Add trickCount property to the interface
}

export async function FeaturedCategories() {
  let categories: Category[] = [];

  try {
    const navigationData = await getNavigationData();

    // Transform the data to include trick counts
    categories = navigationData.map((category: any) => ({
      ...category,
      trickCount: category.subcategories.reduce(
        (total: number, subcategory: any) => total + subcategory.tricks.length,
        0
      ),
    }));
  } catch (error) {
    console.error("Failed to load categories:", error);
    // For SSR, we'll return empty array on error instead of showing loading state
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance mb-4">
            Explore by Discipline
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Dive deep into your favorite movement discipline and discover new
            techniques to master.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            // Get icon component, fallback to iconMap.zap if not found
            const IconComponent =
              iconMap[category.icon_name || "zap"] || iconMap.zap;
            const colorClass = getColorClass(category.color);

            return (
              <Link key={category.id} href={`/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 ${colorClass} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-pretty">
                      Explore {category.name.toLowerCase()} techniques and
                      skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Badge variant="secondary" className="text-xs">
                      {category.trickCount} tricks
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No categories available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
