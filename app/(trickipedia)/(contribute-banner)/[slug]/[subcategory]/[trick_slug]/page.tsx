// app/[categorySlug]/[subcategorySlug]/[trickSlug]/page.tsx (updated)
import type { Metadata } from "next";
import type { TrickWithLinkedPrerequisites } from "@/types/trick";
import { notFound } from "next/navigation";
import { ClientInteractions } from "@/components/tricks/client-interactions";
import { TrickHeader } from "@/components/tricks/trick-header";
import { TrickImageGallery } from "@/components/tricks/trick-image-gallery";
import { StepByStepGuide } from "@/components/tricks/step-by-step-guide";
import { TrickContentSections } from "@/components/tricks/trick-content-sections";
import { ViewPrerequisitesSection } from "@/components/tricks/view-prerequisites-section";
import { VideoTutorials } from "@/components/tricks/video-tutorials";
import { TrickInfoSidebar } from "@/components/tricks/trick-info-sidebar";
import { ExternalLink } from "lucide-react";
import { getTrickBySlugWithLinks } from "@/lib/server/tricks-data-server";

interface TrickDetailPageProps {
  params: Promise<{
    trick_slug: string;
    slug: string;
    subcategory: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: TrickDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const {
    slug: categorySlug,
    subcategory: subcategorySlug,
    trick_slug: trickSlug,
  } = resolvedParams;

  const trick = await getTrickBySlugWithLinks(
    trickSlug,
    subcategorySlug,
    categorySlug
  );

  if (!trick) {
    return {
      title: "Trick Not Found - Trickipedia",
      description: "The requested trick could not be found on Trickipedia.",
    };
  }

  const categoryName = trick.subcategory?.master_category?.name || "Category";
  const subcategoryName = trick.subcategory?.name || "Subcategory";
  const title = `${trick.name} - ${categoryName} ${subcategoryName} - Trickipedia`;
  const description = trick.description
    ? `Learn how to ${trick.name.toLowerCase()}. ${trick.description.substring(
        0,
        140
      )}...`
    : `Learn how to perform a ${trick.name.toLowerCase()}. Get step-by-step instructions, watch video tutorials, and master this move.`;

  const keywords = [
    trick.name.toLowerCase(),
    subcategoryName.toLowerCase(),
    categoryName.toLowerCase(),
    "tutorial",
    "how to",
    "learn",
    "trick",
    "guide",
    "trickipedia",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${categorySlug}/${subcategorySlug}/${trickSlug}`,
      siteName: "Trickipedia",
      publishedTime: trick.created_at || undefined,
      modifiedTime: trick.updated_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TrickDetailPage({
  params,
}: TrickDetailPageProps) {
  const resolvedParams = await params;
  const {
    slug: categorySlug,
    subcategory: subcategorySlug,
    trick_slug: trickSlug,
  } = resolvedParams;

  let trick: TrickWithLinkedPrerequisites | null = null;

  try {
    trick = await getTrickBySlugWithLinks(
      trickSlug,
      categorySlug,
      subcategorySlug
    );
  } catch (error) {
    console.error("Failed to load trick:", error);
    notFound();
  }

  if (!trick) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <TrickHeader
          trick={trick}
          category={{
            name: trick.subcategory?.master_category.name || "Category",
            slug: categorySlug || "",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 mt-6">
            <div className="space-y-6">
              <TrickImageGallery trick={trick} />
              <VideoTutorials trick={trick} />
            </div>

            <div className="lg:hidden">
              <TrickInfoSidebar trick={trick} />
            </div>

            <StepByStepGuide trick={trick} />

            <TrickContentSections trick={trick} />

            {/* FIXED: Use correct props for prerequisites */}
            <ViewPrerequisitesSection trick={trick} />

            <ClientInteractions trick={trick} />
          </div>

          <div className="hidden lg:block">
            <TrickInfoSidebar trick={trick} />
          </div>
        </div>

        {/* Sources and Last edited section - appears at bottom on all screen sizes */}
        <div className="space-y-3 pt-8 mt-8 border-t border-border">
          {trick.source_urls && trick.source_urls.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {trick.source_urls.length > 1 ? "Sources:" : "Source:"}{" "}
              {trick.source_urls.map((url, index) => {
                // Extract domain name for display
                const domain = new URL(url).hostname.replace("www.", "");

                return (
                  <span key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      {domain}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {index < (trick.source_urls?.length ?? 0) - 1 && ", "}
                  </span>
                );
              })}
            </p>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Last edited on{" "}
            {new Date(
              trick.updated_at || trick.created_at || new Date()
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
