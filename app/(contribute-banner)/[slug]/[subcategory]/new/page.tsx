"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createTrick } from "@/lib/client/tricks-data-client";

import { toast } from "sonner";
import { TrickForm } from "@/components/trick-form";
import { TrickData } from "@/types/trick";
import {
  getSubcategoryBySlug,
  Subcategory,
} from "@/lib/client/subcategories-data-client";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";

export default function TrickNewPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.slug as string;
  const subcategorySlug = params.subcategory as string;
  const { user, isLoading: authLoading } = useUser();

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [initialTrick, setInitialTrick] = useState<TrickData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // Track if we've already tried to load to prevent duplicate attempts
  const loadAttempted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const loadSubcategory = async () => {
      // Wait for auth to finish loading before proceeding
      if (authLoading) {
        console.log("Waiting for auth to complete...");
        return;
      }

      // Prevent duplicate load attempts
      if (loadAttempted.current) {
        return;
      }

      if (!subcategorySlug) {
        console.log("No subcategory slug provided");
        setLoadingData(false);
        setLoadingError(true);
        return;
      }

      loadAttempted.current = true;
      console.log("Loading subcategory:", subcategorySlug);

      // Set a timeout to handle cases where the request hangs
      timeoutRef.current = setTimeout(() => {
        console.error("Loading timeout - taking too long");
        setLoadingError(true);
        setLoadingData(false);
        toast.error(
          "Loading is taking longer than expected. Please refresh the page."
        );
      }, 10000); // 10 second timeout

      try {
        const data = await getSubcategoryBySlug(
          supabase,
          category,
          subcategorySlug
        );

        // Clear timeout if successful
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (!data) {
          console.error("Subcategory not found");
          toast.error("Subcategory not found");
          router.push(`/${category}`);
          return;
        }

        console.log("Subcategory loaded successfully:", data.name);

        setSubcategory(data);
        // Set initial form data with subcategory_id pre-filled
        setInitialTrick({
          subcategory_id: data.id,
          name: "",
          slug: "",
          description: "",
          difficulty_level: 5,
          prerequisite_ids: [],
          step_by_step_guide: [
            { step: 1, title: "", description: "", tips: [""] },
          ],
          tips_and_tricks: "",
          common_mistakes: "",
          safety_notes: "",
          video_urls: [""],
          image_urls: [""],
          tags: [""],
          source_urls: [""],
          is_published: false,
          parent_id: "",
          is_combo: false,
          is_promoted: false,
          trick_details: {},
          components: [],
        });

        setLoadingError(false);
      } catch (error) {
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        console.error("Failed to load subcategory:", error);
        toast.error("Failed to load subcategory. Please try again.");
        setLoadingError(true);

        // Give user option to retry or go back
        setTimeout(() => {
          if (
            window.confirm(
              "Failed to load. Would you like to go back to the category page?"
            )
          ) {
            router.push(`/${category}`);
          }
        }, 1000);
      } finally {
        setLoadingData(false);
        console.log("Loading complete");
      }
    };

    loadSubcategory();
  }, [subcategorySlug, authLoading, category, router, supabase]);

  const handleCancel = () => {
    router.push(`/${category}/${subcategorySlug}`);
  };

  // Add this to your new/page.tsx handleSubmit function

  const handleSubmit = async (
    data: TrickData,
    shouldNavigateAway: boolean = true
  ): Promise<boolean> => {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      toast.error("Internal error: Supabase client not available");
      return false;
    }

    console.log("=== STARTING TRICK CREATION ===");
    console.log("User:", user);
    console.log("Data being submitted:", data);
    console.log("Should navigate away:", shouldNavigateAway);

    // Check if user is logged in when submitting
    if (!user) {
      console.error("No user found - redirecting to login");
      toast.error("You must be logged in to create a trick");
      router.push(`/login?redirect=/${category}/${subcategorySlug}/new`);
      return false;
    }

    setLoading(true);
    console.log("Loading state set to TRUE");

    try {
      if (!data.slug) {
        console.error("Missing slug in data");
        throw new Error("Slug is required to create a trick");
      }

      console.log("About to call createTrick with:", {
        dataKeys: Object.keys(data),
        subcategory_id: data.subcategory_id,
        slug: data.slug,
        name: data.name,
      });

      console.time("createTrick API call");

      // @ts-expect-error TODO come back
      const result = await createTrick(supabase, data);

      console.timeEnd("createTrick API call");
      console.log("createTrick result:", result);

      toast.success("Trick created successfully!");

      if (shouldNavigateAway) {
        const navigateTo = `/${category}/${subcategorySlug}/${data.slug}`;
        console.log("Navigating to:", navigateTo);
        router.push(navigateTo);
      }

      console.log("=== TRICK CREATION SUCCESS ===");
      return true;
    } catch (error) {
      console.error("=== TRICK CREATION FAILED ===");
      console.error("Error type:", error?.constructor?.name);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error("Full error object:", error);

      // Log stack trace if available
      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
      }

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("Possible network error");
      }

      toast.error("Failed to create trick. Check console for details.");
      return false;
    } finally {
      console.log("Loading state set to FALSE");
      setLoading(false);
      console.log("=== END OF TRICK CREATION ATTEMPT ===");
    }
  };

  // Show loading state while auth or data is loading
  if (authLoading || (loadingData && !loadingError)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {authLoading
                ? "Checking authentication..."
                : "Loading subcategory..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if loading failed
  if (loadingError || !initialTrick) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-destructive mb-4">Failed to load the page</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${category}`)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/${category}/${subcategorySlug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {subcategory?.name}
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Add New Trick</h1>
          <p className="text-muted-foreground mt-2">
            Create a new trick in {subcategory?.name}
          </p>
        </div>

        <div className="max-w-4xl">
          <TrickForm
            mode="create"
            trick={initialTrick}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
