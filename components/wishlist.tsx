"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ArrowRight, Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useWishlist } from "@/contexts/wishlist-context";
import { TrickSearch } from "@/components/trick-search";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
// Note: We intentionally do NOT filter out mastered tricks here; filtering happens in TrickSearch.

export interface UserProgress {
  userId: string;
  masteredTricks: string[]; // Array of trick IDs
  wishlist: string[]; // Array of trick IDs
  recentlyViewed: string[]; // Array of trick IDs
}
export interface Trick {
  id: string;
  name: string;
  sport: "parkour" | "tricking" | "trampoline" | "freerunning";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  prerequisites: string[]; // Array of trick IDs
}

export function Wishlist() {
  const {
    items,
    loading,
    add,
    remove,
    removing,
    adding,
    refresh,
    lastAddedId,
    clearLastAdded,
  } = useWishlist() as any;
  const [wishlistTricks, setWishlistTricks] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTricks, setSelectedTricks] = useState<Set<string>>(new Set());
  const [addingTricks, setAddingTricks] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const lastAddedRef = useRef<HTMLDivElement | null>(null);

  // Sync local slice for top-5 view
  useEffect(() => {
    setWishlistTricks(items);
  }, [items]);

  // Scroll newly added into view & highlight briefly
  useEffect(() => {
    if (lastAddedId && lastAddedRef.current) {
      lastAddedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const el = lastAddedRef.current;
      el.classList.add("ring", "ring-primary/60", "ring-offset-2");
      const timeout = setTimeout(() => {
        el.classList.remove("ring", "ring-primary/60", "ring-offset-2");
        clearLastAdded();
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [lastAddedId, clearLastAdded]);

  const handleRemoveFromWishlist = (trickId: string) => remove(trickId);

  const handleViewTrick = (trick: any) => {
    const categorySlug = trick.subcategory?.master_category?.slug;
    const subcategorySlug = trick.subcategory?.slug;
    if (categorySlug && subcategorySlug && trick.slug) {
      router.push(`/${categorySlug}/${subcategorySlug}/${trick.slug}`);
    }
  };

  const handleToggleTrick = (trickId: string) => {
    setSelectedTricks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trickId)) {
        newSet.delete(trickId);
      } else {
        newSet.add(trickId);
      }
      return newSet;
    });
  };

  const handleConfirmAddToWishlist = async () => {
    if (selectedTricks.size === 0) return;
    setAddingTricks(true);
    try {
      await Promise.all(Array.from(selectedTricks).map((id) => add(id)));
      toast({
        title: "Added to wishlist",
        description: `${selectedTricks.size} trick${
          selectedTricks.size > 1 ? "s" : ""
        } added to your wishlist`,
      });
      setSelectedTricks(new Set());
      setAddDialogOpen(false);
    } finally {
      setAddingTricks(false);
    }
  };

  // Show the wishlist exactly as stored (mastered tricks may still appear until backend removes them)
  const displayTricks = wishlistTricks.slice(0, 5);
  const hasMore = wishlistTricks.length > 5;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Goal Tricks
            </CardTitle>
            {/* Desktop description */}
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              Track the tricks you want to master next. When you complete a
              trick, we&apos;ll remove it automatically.
            </p>
            {/* Mobile concise description */}
            <p className="sm:hidden text-xs text-muted-foreground mt-1">
              Pick goals & we&apos;ll clear them once mastered.
            </p>
          </div>
          <Dialog
            open={addDialogOpen}
            onOpenChange={(open) => {
              setAddDialogOpen(open);
              if (!open) {
                setSelectedTricks(new Set());
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Trick
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-auto sm:max-w-[650px] flex flex-col max-h-[90vh] overflow-visible">
              <DialogHeader className="shrink-0">
                <DialogTitle>Add Tricks to Wishlist</DialogTitle>
                <DialogDescription>
                  Search for tricks and select multiple to add them to your
                  wishlist
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex-1 min-h-[300px] sm:min-h-[400px] overflow-visible relative">
                <TrickSearch
                  mode="select"
                  variant="default"
                  selectedTricks={selectedTricks}
                  onToggleTrick={handleToggleTrick}
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t shrink-0 bg-background">
                <div className="text-sm text-muted-foreground">
                  {selectedTricks.size === 0 ? (
                    "No tricks selected"
                  ) : (
                    <span className="font-medium text-foreground">
                      {selectedTricks.size} trick
                      {selectedTricks.size > 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    disabled={addingTricks}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmAddToWishlist}
                    disabled={selectedTricks.size === 0 || addingTricks}
                  >
                    {addingTricks ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 rounded-full border-[2px] border-white/30 border-t-white" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add{" "}
                        {selectedTricks.size > 0
                          ? `(${selectedTricks.size})`
                          : ""}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 rounded-full border-[3px] border-muted-foreground/30 border-t-muted-foreground" />
            <p>Loading wishlist...</p>
          </div>
        ) : displayTricks.length > 0 ? (
          <div className="space-y-3">
            {displayTricks.map((trick) => {
              const ref = trick.id === lastAddedId ? lastAddedRef : undefined;
              return (
                <div
                  key={trick.id}
                  ref={ref as any}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium truncate max-w-[200px] sm:max-w-none">
                        {trick.name}
                      </h3>
                      {trick.subcategory?.master_category?.name && (
                        <Badge
                          variant="outline"
                          className="capitalize text-xs shrink-0"
                        >
                          {trick.subcategory.master_category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTrick(trick)}
                      className="px-2 sm:px-3"
                    >
                      <span className="hidden xs:inline">View</span>
                      <ArrowRight className="w-4 h-4 ml-0 xs:ml-1" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${trick.name} from wishlist`}
                      disabled={removing[trick.id]}
                      onClick={() => handleRemoveFromWishlist(trick.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 px-2 sm:px-3"
                    >
                      {removing[trick.id] ? (
                        <div className="animate-spin h-4 w-4 rounded-full border-[2px] border-red-500/30 border-t-red-500" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-sm sm:text-base"
                >
                  View All ({wishlistTricks.length} trick
                  {wishlistTricks.length === 1 ? "" : "s"})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="mb-4">
              Add tricks to your wishlist to track your goals!
            </p>
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Trick
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
