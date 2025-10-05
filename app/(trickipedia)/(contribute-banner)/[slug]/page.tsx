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

        {/* Hidden / Unlisted Notice */}
        {!category.is_active && (
          <div className="mb-10 rounded-lg border border-amber-300/60 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-950/30 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Badge
              variant="outline"
              className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-300/70 dark:border-amber-700/60"
            >
              Unlisted
            </Badge>
            <p className="text-sm text-amber-900 dark:text-amber-100/80 leading-relaxed">
              This {category.move_name || "category"} is currently hidden from
              public listings. You can access it directly via URL, but it
              won&apos;t appear in navigation or search until it&apos;s
              published.
            </p>
          </div>
        )}

        {/* Category Header (image hero) */}
        <div className="relative mb-4 rounded-3xl  lg:w-1/2 mx-auto overflow-hidden border bg-muted/30 min-h-[280px] sm:min-h-[320px] md:min-h-[360px] flex items-stretch">
          {visual ? (
            <>
              {/* Background blur layer for better image handling */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${visual.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                }}
              />
              {/* Main image layer */}
              <img
                src={visual.image || "/placeholder.svg"}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: category.color || "hsl(var(--muted))" }}
            >
              <IconComponent className="h-24 w-24 text-white/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            </div>
          )}

          <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 flex flex-col justify-end w-full max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant="secondary"
                className="text-xs backdrop-blur-sm bg-white/15 text-white border-white/25 shadow-lg"
              >
                {category.trick_count} total {category.move_name + "s"}
              </Badge>
              {!category.is_active && (
                <Badge
                  variant="outline"
                  className="text-xs backdrop-blur-sm bg-amber-500/25 text-amber-50 border-amber-300/40 shadow-lg"
                >
                  Unlisted
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance mb-3 drop-shadow-2xl">
              {category.name}
            </h1>

            {category.description && (
              <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl leading-relaxed drop-shadow-lg">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="mb-12">
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
              <p className="text-muted-foreground">
                No {category.move_name + "s"} have been added to {category.name}{" "}
                yet.
              </p>
            </div>
          )}
        </div>

        {/* <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Browse by Category
            </h2>
            <p className="text-sm text-muted-foreground">
              Or explore individual categories in detail
            </p>
          </div>
          {subcategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/${category.slug}/${subcategory.slug}`}
                >
                  <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-base">
                          {subcategory.name}
                        </CardTitle>
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription className="text-xs text-pretty line-clamp-2">
                        {subcategory.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}

              <PermissionGate requireModerator>
                <Link href={`/admin/${category.slug}`}>
                  <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-base">
                          Manage Categories
                        </CardTitle>
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription className="text-xs text-pretty">
                        Add and organize categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-600 border-blue-200"
                      >
                        Admin
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </PermissionGate>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center py-12 bg-muted/30 rounded-lg w-full">
                <p className="text-muted-foreground">
                  No subcategories found for this discipline.
                </p>
              </div>

              <PermissionGate requireModerator>
                <Link href={`/${category.slug}/manage-categories`}>
                  <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 bg-blue-500">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">
                        Manage Trick Categories
                      </CardTitle>
                      <CardDescription className="text-sm text-pretty">
                        Add trick categories to organize {category.name} tricks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-600 border-blue-200 mb-3"
                      >
                        Admin Tools
                      </Badge>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </PermissionGate>
            </div>
          )}
        </div> */}
      </main>
    </div>
  );
}
