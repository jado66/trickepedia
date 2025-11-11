"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoveIcon, ChevronLeft, ChevronRight, FolderIcon } from "lucide-react";
import { toast } from "sonner";
import { TrickWithLinkedPrerequisites } from "@/types/trick";
import type {
  NavigationCategory,
  NavigationSubcategory,
} from "@/components/side-nav/types";
import { supabase } from "@/utils/supabase/client";

interface MoveTrickDialogProps {
  trick: TrickWithLinkedPrerequisites;
}

export function MoveTrickDialog({ trick }: MoveTrickDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [navigationData, setNavigationData] = useState<NavigationCategory[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] =
    useState<NavigationCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<NavigationSubcategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [shouldAutoPreselect, setShouldAutoPreselect] = useState(true);

  // Fetch navigation data when dialog opens
  useEffect(() => {
    if (!supabase) return;

    if (open && navigationData.length === 0) {
      fetchNavigationData();
    }
  }, [open, navigationData.length, supabase]);

  // Preselect current category when navigation data is loaded
  useEffect(() => {
    if (!supabase) return;

    if (
      navigationData.length > 0 &&
      !selectedCategory &&
      shouldAutoPreselect &&
      trick.subcategory?.master_category.slug
    ) {
      const currentCategory = navigationData.find(
        (cat) => cat.slug === trick.subcategory?.master_category.slug
      );
      if (currentCategory) {
        setSelectedCategory(currentCategory);
      }
    }
  }, [
    navigationData,
    selectedCategory,
    shouldAutoPreselect,
    trick.subcategory?.master_category.slug,
    supabase,
  ]);

  const fetchNavigationData = async () => {
    setLoading(true);
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
          subcategories(
            id,
            name,
            slug,
            sort_order
          )
        `
        )
        .eq("is_active", true)
        .eq("subcategories.is_active", true)
        .order("sort_order")
        .order("sort_order", { foreignTable: "subcategories" });

      if (error) {
        console.error("Error fetching navigation data:", error);
        toast.error("Failed to load categories");
        return;
      }

      // Transform the data to match NavigationCategory type
      const transformedCategories: NavigationCategory[] = (data || []).map(
        (category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon_name: category.icon_name,
          color: category.color,
          sort_order: category.sort_order,
          subcategories: (category.subcategories || []).map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            sort_order: sub.sort_order,
          })),
          subcategoriesLoaded: true,
          subcategoriesLoading: false,
        })
      );

      setNavigationData(transformedCategories);
    } catch (error) {
      console.error("Unexpected error fetching navigation:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selectedSubcategory) {
      toast.error("Please select a subcategory");
      return;
    }

    if (
      selectedSubcategory.slug === trick.subcategory?.slug &&
      selectedCategory?.slug === trick.subcategory?.master_category.slug
    ) {
      toast.error("Trick is already in this subcategory");
      return;
    }

    setMoving(true);
    try {
      const { error } = await supabase
        .from("tricks")
        .update({ subcategory_id: selectedSubcategory.id })
        .eq("id", trick.id);

      if (error) throw error;

      toast.success(
        `Trick moved to ${selectedCategory?.name} > ${selectedSubcategory.name}`
      );
      setOpen(false);

      // Redirect to the new location
      router.push(
        `/${selectedCategory?.slug}/${selectedSubcategory.slug}/${trick.slug}`
      );
    } catch (error) {
      console.error("Failed to move trick:", error);
      toast.error("Failed to move trick");
    } finally {
      setMoving(false);
    }
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShouldAutoPreselect(false); // Prevent auto-preselection when user manually goes back
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      // Reset selection when dialog opens to ensure fresh state
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setShouldAutoPreselect(true); // Enable auto-preselection when dialog opens
    }
  };

  const currentPath = selectedCategory
    ? selectedSubcategory
      ? `${selectedCategory.name} > ${selectedSubcategory.name}`
      : selectedCategory.name
    : "Select Category";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MoveIcon className="h-4 w-4 mr-2" />
          Move
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Trick</DialogTitle>
          <DialogDescription>
            Move &quot;{trick.name}&quot; to a different category and
            subcategory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
            <FolderIcon className="h-4 w-4" />
            <span>{currentPath}</span>
          </div>

          {/* Navigation */}
          {selectedCategory && !selectedSubcategory && (
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSelection}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Categories
              </Button>
            </div>
          )}

          <ScrollArea className="h-64 border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : !selectedCategory ? (
              // Show master categories
              <div className="p-2">
                {navigationData.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="w-full p-3 text-left hover:bg-muted/50 rounded-md flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#6b7280" }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            ) : (
              // Show subcategories for selected category
              <div className="p-2">
                {selectedCategory.subcategories?.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`w-full p-3 text-left hover:bg-muted/50 rounded-md transition-colors ${
                      selectedSubcategory?.id === subcategory.id
                        ? "bg-primary/10 border border-primary/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subcategory.name}</span>
                      {subcategory.slug === trick.subcategory?.slug &&
                        selectedCategory?.slug ===
                          trick.subcategory?.master_category.slug && (
                          <span className="text-xs text-muted-foreground">
                            (Current)
                          </span>
                        )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedSubcategory || moving}
          >
            {moving ? "Moving..." : "Move Trick"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
