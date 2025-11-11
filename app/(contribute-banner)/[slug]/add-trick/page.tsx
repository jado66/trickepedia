"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TrickForm } from "@/components/trick-form";
import { TrickData } from "@/types/trick";
import { useUser } from "@/contexts/user-provider";
import { createTrick } from "@/lib/client/tricks-data-client";
import { getMasterCategoryBySlug } from "@/lib/client/categories-data-client";
import {
  getSubcategoriesByMasterCategory,
  Subcategory,
} from "@/lib/client/subcategories-data-client";
import { supabase } from "@/utils/supabase/client";

// Page: /[slug]/add-trick
// Lets a user select a subcategory (within the current master category) and then shows the TrickForm.

export default function AddTrickGenericPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const masterCategorySlug = params.slug as string;
  const preselectSubSlug = searchParams.get("subcategory") || undefined;
  const prefillName = searchParams.get("name") || undefined;

  const { user, isLoading: authLoading } = useUser();

  const [masterCategoryId, setMasterCategoryId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState<string>("");
  const [initialTrick, setInitialTrick] = useState<TrickData | null>(null);
  const [saving, setSaving] = useState(false);

  // Load master category & its subcategories
  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      setSubLoading(true);
      setSubError(null);
      try {
        const cat = await getMasterCategoryBySlug(masterCategorySlug);
        if (!cat) {
          setSubError("Master category not found");
          return;
        }
        setMasterCategoryId(cat.id);
        const subs = await getSubcategoriesByMasterCategory(
          supabase,
          cat.id,
          true
        );
        setSubcategories(subs.filter((s) => s.is_active !== false));
        // Preselect if query param provided
        if (preselectSubSlug) {
          const pre = subs.find((s) => s.slug === preselectSubSlug);
          if (pre) {
            setSelectedSubcategoryId(pre.id);
          }
        }
      } catch (e: any) {
        console.error(e);
        setSubError(e.message || "Failed to load subcategories");
      } finally {
        setSubLoading(false);
      }
    };
    load();
  }, [masterCategorySlug, preselectSubSlug]);

  // Prepare initial trick when subcategory selected
  useEffect(() => {
    if (!selectedSubcategoryId) {
      setInitialTrick(null);
      return;
    }
    setInitialTrick({
      subcategory_id: selectedSubcategoryId,
      name: prefillName || "",
      slug: "",
      description: "",
      difficulty_level: 5,
      prerequisite_ids: [],
      step_by_step_guide: [{ step: 1, title: "", description: "", tips: [""] }],
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
  }, [selectedSubcategoryId, prefillName]);

  const handleSubmit = async (data: TrickData, shouldNavigateAway = true) => {
    if (!user) {
      toast.error("You must be logged in to create a trick");
      router.push(`/login?redirect=/${masterCategorySlug}/add-trick`);
      return false;
    }
    if (!data.subcategory_id) {
      toast.error("Please select a subcategory");
      return false;
    }
    setSaving(true);
    try {
      // @ts-expect-error internal type narrowing
      await createTrick(supabase, data);
      toast.success("Trick created");
      if (shouldNavigateAway) {
        router.push(`/${masterCategorySlug}`); // generic redirect; user can refine later
      }
      return true;
    } catch (e: any) {
      console.error(e);
      // Try to extract a useful message from the error object.
      let message = "Failed to create trick";
      const errMsg =
        (
          e &&
          (e.message ||
            e.error ||
            (typeof e === "string" ? e : JSON.stringify(e)))
        )?.toString() || "";

      // Database unique constraint / duplicate key
      if (
        errMsg.toLowerCase().includes("duplicate key") ||
        errMsg.toLowerCase().includes("unique constraint") ||
        errMsg.includes("tricks_subcategory_id_slug_key")
      ) {
        message =
          "A trick with that url or name already exists in this category. It's likely already a trick.";
      } else if (
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes("insufficient")
      ) {
        message =
          "You don't have permission to create a trick. Please sign in or contact an admin.";
      } else if (errMsg) {
        // Show the raw error message as a fallback (trimmed)
        message = errMsg.replace(/\s+/g, " ").trim();
      }

      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${masterCategorySlug}`);
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (subError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{subError}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/${masterCategorySlug}`)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/${masterCategorySlug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Category
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Add Trick</h1>
        <p className="text-muted-foreground mb-8">
          Select a subcategory then fill out the trick details.
        </p>

        {/* Subcategory selection */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <Select
                value={selectedSubcategoryId}
                onValueChange={(val) => setSelectedSubcategoryId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {!selectedSubcategoryId && (
            <p className="text-sm text-muted-foreground">
              Choose a category to start.
            </p>
          )}
        </div>

        {initialTrick && (
          <TrickForm
            mode="create"
            trick={initialTrick}
            onSubmit={handleSubmit}
            loading={saving}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
