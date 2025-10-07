import type React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMasterCategoryBySlug } from "@/lib/server/categories-data-server";
import { getSubcategoriesByMasterCategory } from "@/lib/server/subcategories-data-server";
import { getTricks } from "@/lib/server/tricks-data-server";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";
import * as Icons from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import { TricksBrowser } from "@/components/category/tricks-browser";
import { iconMap } from "@/components/side-nav";
import { getCategoryImage } from "@/components/category/category-images";
import NotFoundComponent from "@/components/not-found";
import { Button } from "@/components/ui/button";
import { CategoryHero } from "@/components/category/category-hero"; // NEW animated hero

// Allow on-demand rendering so hidden/unlisted categories that are not part of any static paths still resolve.
export const dynamic = "force-dynamic";

const DIFFICULTY_LABELS = {
  1: "Beginner",
  2: "Beginner",
  3: "Beginner",
  4: "Intermediate",
  5: "Intermediate",
  6: "Intermediate",
  7: "Advanced",
  8: "Advanced",
  9: "Expert",
  10: "Expert",
};

const DIFFICULTY_COLORS = {
  1: "bg-green-500",
  2: "bg-green-500",
  3: "bg-green-500",
  4: "bg-yellow-500",
  5: "bg-yellow-500",
  6: "bg-yellow-500",
  7: "bg-orange-500",
  8: "bg-orange-500",
  9: "bg-red-500",
  10: "bg-red-500",
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getMasterCategoryBySlug(slug);

  if (!category) {
    console.error("Category not found for metadata generation:", slug);

    return {
      title: "Category Not Found - Trickipedia",
      description: "The requested category could not be found on Trickipedia.",
    };
  }

  const categoryName = category.name;
  const title = `${categoryName} Tricks - Trickipedia`;
  const description = `Discover and learn ${categoryName.toLowerCase()} tricks on Trickipedia. Browse subcategories, watch tutorials, and master every move in ${categoryName.toLowerCase()}.`;

  return {
    title,
    description,
    keywords: [
      categoryName.toLowerCase(),
      "tricks",
      "tutorials",
      "how to",
      "learn",
      "trickipedia",
      "action sports",
      "movement",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${slug}`,
      siteName: "Trickipedia",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const [category, subcategories, tricksResponse] = await Promise.all([
    getMasterCategoryBySlug(slug),
    getMasterCategoryBySlug(slug).then((cat) =>
      cat ? getSubcategoriesByMasterCategory(cat.id) : []
    ),
    getTricks({
      category: slug,
      sortBy: "difficulty_level",
      sortOrder: "asc",
    }),
  ]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <NotFoundComponent />
      </div>
    );
  }

  const tricks = tricksResponse?.tricks || [];

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap.circle;
  };

  const IconComponent = getIconComponent(category.icon_name || "circle");
  const visual = getCategoryImage(category.slug);
  const iconName = category.icon_name || "circle";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/sports-and-disciplines"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sports &amp; Disciplines
          </Link>
        </div>

        {/* Animated Category Hero */}
        <CategoryHero
          visual={visual}
          name={category.name}
          description={category.description}
          moveName={category.move_name ?? "trick"}
          trickCount={category.trick_count ?? 0}
          isActive={!!category.is_active}
          iconName={iconName}
        />

        <div className="mb-12 mt-8">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold capitalize text-center">
              Explore {category.name} {category.move_name + "s"}
            </h2>
          </div>

          {tricks.length > 0 ? (
            <TricksBrowser
              tricks={tricks}
              categorySlug={category.slug}
              categoryName={category.name}
              subcategories={subcategories.map((sub) => ({
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                trick_count: sub.trick_count,
              }))}
              difficultyLabels={DIFFICULTY_LABELS}
              difficultyColors={DIFFICULTY_COLORS}
              moveName={category.move_name ?? "trick"}
            />
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-8">
                No {category.move_name + "s"} have been added to {category.name}{" "}
                yet.
              </p>
              {/* add trick */}
              <Link
                href={`/${category.slug}/add-trick`}
                className="mt-4 ml-auto "
              >
                <Button variant="default" size="lg" className="h-8 capitalize">
                  <Icons.Plus className="mr-2 h-4 w-4 " />
                  Add First {category.move_name || "Trick"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
