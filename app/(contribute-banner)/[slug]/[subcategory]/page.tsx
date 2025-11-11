import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getSubcategoryBySlug } from "@/lib/server/subcategories-data-server";
import { getTricks } from "@/lib/server/tricks-data-server";
import { ArrowLeft } from "lucide-react";
import { TricksList } from "@/components/subcategory/tricks-list";
import { AddTrickCard } from "@/components/subcategory/add-trick-card";
import NotFound from "@/app/not_found";

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
    subcategory: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: categorySlug, subcategory: subcategorySlug } = await params;

  const subcategory = await getSubcategoryBySlug(subcategorySlug, categorySlug);

  if (!subcategory) {
    return {
      title: "Subcategory Not Found - Trickipedia",
      description:
        "The requested subcategory could not be found on Trickipedia.",
    };
  }

  const categoryName = subcategory.master_category?.name || "Category";
  const title = `${subcategory.name} Tricks - ${categoryName} - Trickipedia`;
  const description = `Learn ${subcategory.name.toLowerCase()} tricks in ${categoryName.toLowerCase()}. Watch tutorials, get step-by-step instructions, and master every move.`;

  return {
    title,
    description,
    keywords: [
      subcategory.name.toLowerCase(),
      categoryName.toLowerCase(),
      "tricks",
      "tutorials",
      "how to",
      "learn",
      "trickipedia",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${categorySlug}/${subcategorySlug}`,
      siteName: "Trickipedia",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { slug: categorySlug, subcategory: subcategorySlug } = await params;

  // Fetch data server-side with difficulty sorting (easiest first)
  const [subcategory, tricksResponse] = await Promise.all([
    getSubcategoryBySlug(categorySlug, subcategorySlug),
    getTricks({
      category: categorySlug,
      subcategory: subcategorySlug,
      sortBy: "difficulty_level",
      sortOrder: "asc",
    }),
  ]);

  if (!subcategory) {
    return <NotFound />;
  }

  const tricks = tricksResponse.tricks || [];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link
            href={`/${categorySlug}`}
            className="hover:text-primary transition-colors"
          >
            {subcategory.master_category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{subcategory.name}</span>
        </div>

        {/* Subcategory Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">
            {subcategory.name}
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-6">
            {subcategory.description}
          </p>
        </div>

        {/* Tricks List */}
        <TricksList
          tricks={tricks}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
          subcategoryName={subcategory.name}
          difficultyLabels={DIFFICULTY_LABELS}
          difficultyColors={DIFFICULTY_COLORS}
        />

        {/* Fallback for empty state */}
        {tricks.length === 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button variant="outline" asChild>
              <Link href={`/${categorySlug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {subcategory.master_category?.name}
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
