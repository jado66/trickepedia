//app\(trickipedia)\(main)\[slug]\[subcategory]\[trick_slug]\edit\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTrickBySlug, updateTrick } from "@/lib/client/tricks-data-client";

import { toast } from "sonner";
import { TrickForm } from "@/components/trick-form";
import { Trick, TrickData } from "@/types/trick";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";

export default function TrickEditPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.slug as string;
  const slug = params.trick_slug as string;
  const subcategory = params.subcategory as string;
  const { user, hasModeratorAccess, isLoading: authLoading } = useUser();

  const [trick, setTrick] = useState<Trick | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const loadTrick = async () => {
      // Wait for auth to load
      if (authLoading) return;

      if (!slug) {
        setError("Invalid trick identifier");
        setLoading(false);
        return;
      }

      try {
        const data = await getTrickBySlug(
          supabase,
          category,
          subcategory,
          slug
        );

        if (!data) {
          toast.error("Trick not found");
          router.push(`/${category}/${subcategory}`);
          return;
        }

        // Check permissions
        if (!user) {
          toast.error("You must be logged in to edit tricks");
          router.push(`/${category}/${subcategory}/${data.slug}`);
          return;
        }

        setTrick(data);
        setError(null);
      } catch (error) {
        console.error("Failed to load trick:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load trick"
        );
        toast.error("Failed to load trick");
      } finally {
        setLoading(false);
      }
    };

    loadTrick();
  }, [slug, user, authLoading, router, category, subcategory, supabase]);

  const handleCancel = () => {
    if (trick) {
      router.push(`/${category}/${subcategory}/${trick.slug}`);
    } else {
      router.push(`/${category}/${subcategory}`);
    }
  };

  const handleSubmit = async (
    data: TrickData,
    shouldNavigateAway?: boolean
  ): Promise<boolean> => {
    if (!trick || submitLoading) return false;

    // Validation: require at least one video or image URL
    const hasVideo =
      Array.isArray(data.video_urls) &&
      data.video_urls.filter((url) => url && url.trim() !== "").length > 0;
    const hasImage =
      Array.isArray(data.image_urls) &&
      data.image_urls.filter((url) => url && url.trim() !== "").length > 0;
    if (!hasVideo && !hasImage) {
      toast.error(
        "Please add at least one video or image URL before submitting."
      );
      return false;
    }

    setSubmitLoading(true);
    try {
      await updateTrick(supabase, trick.id, data);
      toast.success(
        "Trick updated successfully! Please wait a couple minutes to see your change take place."
      );
      if (shouldNavigateAway !== false) {
        router.push(`/${category}/${subcategory}/${data.slug}`);
      }
      return true;
    } catch (error) {
      console.error("Failed to update trick:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update trick"
      );
      return false;
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Trigger useEffect by updating a dependency (we can use a simple state toggle)
    window.location.reload();
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {authLoading
                  ? "Checking authentication..."
                  : "Loading trick..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-destructive text-2xl">⚠</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Failed to Load Trick
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="mr-2">
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/${category}/${subcategory}`)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Category
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!trick) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Trick Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested trick could not be found.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/${category}/${subcategory}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Category
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert trick data to form format
  const formTrick: TrickData = {
    subcategory_id: trick.subcategory_id || "",
    name: trick.name,
    slug: trick.slug,
    description: trick.description || "",
    difficulty_level: trick.difficulty_level || 5,
    prerequisite_ids:
      trick.prerequisite_ids?.filter((p) => p.trim() !== "") || [],
    step_by_step_guide: trick.step_by_step_guide?.length
      ? trick.step_by_step_guide.map((step) => ({
          ...step,
          tips: step.tips ?? [""],
        }))
      : [{ step: 1, title: "", description: "", tips: [""] }],
    tips_and_tricks: trick.tips_and_tricks || "",
    common_mistakes: trick.common_mistakes || "",
    safety_notes: trick.safety_notes || "",
    video_urls: trick.video_urls?.length ? trick.video_urls : [""],
    image_urls: trick.image_urls?.length ? trick.image_urls : [""],
    tags: trick.tags?.length ? trick.tags : [""],
    source_urls: trick.source_urls?.length ? trick.source_urls : [""],
    is_published: trick.is_published || false,
    parent_id: trick.parent_id || "",
    is_combo: trick.is_combo || false,
    is_promoted: trick.is_promoted || false,
    trick_details: trick.trick_details || {},
    components: trick.components || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/${category}/${subcategory}/${trick.slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trick
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Edit Trick</h1>
          <p className="text-muted-foreground mt-2">
            Update the details for {trick.name}
          </p>
        </div>

        <div className="max-w-4xl">
          <TrickForm
            mode="edit"
            trick={formTrick}
            onSubmit={handleSubmit}
            loading={submitLoading}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
