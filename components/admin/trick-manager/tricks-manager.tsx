"use client";
import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Save, RefreshCw, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MasterCategory,
  Subcategory,
  Trick,
  TrickFormData,
} from "@/types/trick-manager";
import { DifficultyZone } from "./difficulty-zone";
import { TrickItem } from "./trick-item";
import { SortableTrickItem } from "./sortable-trick-item";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase/client";
import { useTheme } from "next-themes";

export function TricksDndManager() {
  const { theme } = useTheme();

  // Utility function to adjust color brightness for dark mode
  const adjustColorForTheme = (color: string) => {
    if (theme !== "dark" || !color) return color;

    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Lighten the color for dark mode (increase brightness by 40%)
    const lighten = (c: number) =>
      Math.min(255, Math.floor(c + (255 - c) * 0.4));

    const newR = lighten(r).toString(16).padStart(2, "0");
    const newG = lighten(g).toString(16).padStart(2, "0");
    const newB = lighten(b).toString(16).padStart(2, "0");

    return `#${newR}${newG}${newB}`;
  };

  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [originalTricks, setOriginalTricks] = useState<Trick[]>([]);
  const [modifiedTricks, setModifiedTricks] = useState<
    Map<string, { subcategory_id?: string; difficulty_level?: number }>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingTrick, setAddingTrick] = useState(false);
  const [formData, setFormData] = useState<TrickFormData>({
    name: "",
    description: "",
    difficulty_level: 1,
    subcategory_id: "",
    // Unified media field
    media_url: "",
  });
  const [detectedMediaType, setDetectedMediaType] = useState<
    "youtube" | "image" | "unknown"
  >("unknown");
  const [activeId, setActiveId] = useState<string | null>(null);
  // Inline difficulty select now always visible (removed toggle state)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (supabase) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedCategory) {
      if (supabase) {
        fetchSubcategoriesByCategory(selectedCategory);
        fetchTricksByCategory(selectedCategory);
      } else {
        setSubcategories([]);

        setTricks([]);
        setOriginalTricks([]);
      }
    }
  }, [selectedCategory, supabase]);

  const fetchCategories = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("master_categories")
        .select("id, name, slug, color, icon_name")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      // @ts-expect-error todo fix me
      setCategories(data || []);

      if (data && data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const fetchSubcategoriesByCategory = async (categoryId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug, master_category_id")
        .eq("master_category_id", categoryId)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setSubcategories(data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setError("Failed to load subcategories");
    }
  };

  const fetchTricksByCategory = async (categoryId: string) => {
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setModifiedTricks(new Map());

    try {
      const { data, error } = await supabase
        .from("tricks")
        .select(
          `
          id,
          name,
          slug,
          description,
          difficulty_level,
          subcategory_id,
          subcategory:subcategories!inner(
            id,
            name,
            slug,
            master_category:master_categories!inner(
              id,
              name,
              slug,
              color
            )
          )
        `
        )
        .eq("subcategory.master_category.id", categoryId)
        .eq("is_published", true)
        .order("difficulty_level", { ascending: true, nullsFirst: true });

      if (error) throw error;

      const tricksData = (data || []).map((trick: any) => ({
        ...trick,
        subcategory: trick.subcategory?.[0]
          ? {
              id: trick.subcategory[0].id,
              name: trick.subcategory[0].name,
              slug: trick.subcategory[0].slug,
              master_category: trick.subcategory[0].master_category?.[0]
                ? {
                    name: trick.subcategory[0].master_category[0].name,
                    slug: trick.subcategory[0].master_category[0].slug,
                    color: trick.subcategory[0].master_category[0].color,
                  }
                : undefined,
            }
          : undefined,
      }));
      setTricks(tricksData);
      setOriginalTricks(JSON.parse(JSON.stringify(tricksData)));
    } catch (err) {
      console.error("Error fetching tricks:", err);
      setError("Failed to load tricks");
    } finally {
      setLoading(false);
    }
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);

    // Reduce scroll speed during drag
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = "auto";
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    // Restore smooth scrolling after drag
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = "smooth";
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the trick being dragged
    const activeTrick = tricks.find((t) => t.id === activeId);
    if (!activeTrick) return;

    let targetSubcategoryId: string | null = null;
    let targetDifficulty: number | null = null;

    // Parse the drop target ID
    if (overId.includes("-difficulty-")) {
      // Dropped on a difficulty zone
      const parts = overId.split("-difficulty-");
      targetSubcategoryId = parts[0] === "unassigned" ? null : parts[0];
      targetDifficulty = Number.parseInt(parts[1]);
    } else {
      // If dropped on another trick, find its subcategory and difficulty
      const targetTrick = tricks.find((t) => t.id === overId);
      if (targetTrick) {
        targetSubcategoryId = targetTrick.subcategory_id || null;
        targetDifficulty = targetTrick.difficulty_level;
      }
    }

    // Only update if something changed
    const subcategoryChanged =
      activeTrick.subcategory_id !== targetSubcategoryId;
    const difficultyChanged =
      targetDifficulty !== null &&
      activeTrick.difficulty_level !== targetDifficulty;

    if (subcategoryChanged || difficultyChanged) {
      // Update tricks array
      const newTricks = tricks.map((trick) => {
        if (trick.id === activeId) {
          return {
            ...trick,
            subcategory_id: targetSubcategoryId,
            difficulty_level:
              targetDifficulty !== null
                ? targetDifficulty
                : trick.difficulty_level,
          };
        }
        return trick;
      });

      setTricks(newTricks);

      // Track modification
      setModifiedTricks((prev) => {
        const newMap = new Map(prev);
        const originalTrick = originalTricks.find((t) => t.id === activeId);

        // Check if this brings the trick back to its original state
        if (
          originalTrick &&
          originalTrick.subcategory_id === targetSubcategoryId &&
          originalTrick.difficulty_level ===
            (targetDifficulty !== null
              ? targetDifficulty
              : activeTrick.difficulty_level)
        ) {
          // Remove from modified if it's back to original
          newMap.delete(activeId);
        } else {
          // Add to modified
          newMap.set(activeId, {
            subcategory_id: targetSubcategoryId || undefined,
            difficulty_level:
              targetDifficulty !== null
                ? targetDifficulty
                : activeTrick.difficulty_level || undefined,
          });
        }
        return newMap;
      });

      setSuccess("Trick moved successfully");
      setTimeout(() => setSuccess(null), 3000);
    }
  }

  const saveChanges = async () => {
    if (modifiedTricks.size === 0) {
      setError("No changes to save");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (supabase) {
        for (const [trickId, changes] of modifiedTricks.entries()) {
          const { error } = await supabase
            .from("tricks")
            .update({
              subcategory_id: changes.subcategory_id,
              difficulty_level: changes.difficulty_level,
              updated_at: new Date().toISOString(),
            })
            .eq("id", trickId);

          if (error) throw error;
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(
          "[v0] Mock save - would update:",
          Array.from(modifiedTricks.entries())
        );
      }

      setSuccess(`Successfully updated ${modifiedTricks.size} trick(s)`);
      setModifiedTricks(new Map());
      setOriginalTricks(JSON.parse(JSON.stringify(tricks)));

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setTricks(JSON.parse(JSON.stringify(originalTricks)));
    setModifiedTricks(new Map());
    setSuccess("Changes reset");
    setTimeout(() => setSuccess(null), 3000);
  };

  function classifyMedia(url: string): "youtube" | "image" | "unknown" {
    if (!url) return "unknown";
    const ytRegex =
      /^(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{6,})/i;
    if (ytRegex.test(url)) return "youtube";
    const imageRegex = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
    if (imageRegex.test(url.split(/[?#]/)[0])) return "image";
    return "unknown";
  }

  const handleAddTrick = async () => {
    console.log("[TricksManager] handleAddTrick invoked", { formData });
    if (addingTrick) {
      console.log(
        "[TricksManager] Already adding a trick, ignoring duplicate click"
      );
      return;
    }
    if (!formData.name.trim()) {
      setError("Trick name is required");
      alert("Trick name is required");
      console.warn("[TricksManager] Aborting add: name missing");
      return;
    }
    const mediaType = classifyMedia(formData.media_url?.trim() || "");
    if (mediaType === "unknown") {
      setError("Enter a valid YouTube link or direct image URL");
      setTimeout(() => setError(null), 4000);
      console.error("Enter a valid YouTube link or direct image URL");
      console.warn("[TricksManager] Media classification failed", {
        media_url: formData.media_url,
      });
      return;
    }

    try {
      setAddingTrick(true);
      const start = performance.now();
      if (supabase) {
        const slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        console.log("[TricksManager] Inserting trick into supabase", { slug });
        const { data, error } = await supabase
          .from("tricks")
          .insert({
            name: formData.name,
            slug,
            description: formData.description || null,
            difficulty_level: formData.difficulty_level,
            subcategory_id: formData.subcategory_id || null,
            image_urls:
              mediaType === "image" && formData.media_url?.trim()
                ? [formData.media_url.trim()]
                : [],
            video_urls:
              mediaType === "youtube" && formData.media_url?.trim()
                ? [formData.media_url.trim()]
                : [],
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        console.log("[TricksManager] Insert success", { data });

        if (selectedCategory) {
          console.log(
            "[TricksManager] Refreshing tricks for category",
            selectedCategory
          );
          await fetchTricksByCategory(selectedCategory);
        }
      } else {
        console.error("No Supabase client ");

        const newTrick: Trick = {
          id: Date.now().toString(),
          name: formData.name,
          slug: formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          description: formData.description || undefined,
          difficulty_level: formData.difficulty_level,
          subcategory_id: formData.subcategory_id || null,
        };

        setTricks((prev) => [...prev, newTrick]);
        setOriginalTricks((prev) => [...prev, newTrick]);
      }

      setShowAddDialog(false);
      setFormData({
        name: "",
        description: "",
        difficulty_level: 1,
        subcategory_id: "",
        media_url: "",
      });
      setDetectedMediaType("unknown");
      setSuccess("Trick added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding trick:", err);
      setError("Failed to add trick");
    } finally {
      const end = performance.now();
      console.log(
        `{TricksManager] handleAddTrick finished in ${Math.round(
          end - (performance as any).timeOrigin || end
        )}ms`
      );
      setAddingTrick(false);
    }
  };

  const getTricksForDifficulty = (
    subcategoryId: string | null,
    difficulty: number
  ) => {
    return tricks.filter(
      (trick) =>
        trick.subcategory_id === subcategoryId &&
        trick.difficulty_level === difficulty
    );
  };

  const getTricksForSubcategory = (subcategoryId: string | null) => {
    return tricks
      .filter((trick) => trick.subcategory_id === subcategoryId)
      .sort((a, b) => (a.difficulty_level || 0) - (b.difficulty_level || 0));
  };

  const getUnassignedTricks = () => {
    return tricks.filter((trick) => !trick.subcategory_id);
  };

  const getOrphanedTricks = () => {
    return tricks.filter((trick) => !trick.difficulty_level);
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const categoryColor = currentCategory?.color || "#3b82f6";
  const themeAdjustedCategoryColor = adjustColorForTheme(categoryColor);
  const difficultyLevels = Array.from({ length: 10 }, (_, i) => i + 1);
  const activeTrick = activeId ? tricks.find((t) => t.id === activeId) : null;

  // Prefill add trick dialog with selected difficulty & subcategory
  function openAddTrickAt(subcategoryId: string | null, difficulty: number) {
    setFormData((prev) => ({
      ...prev,
      difficulty_level: difficulty,
      subcategory_id: subcategoryId || "",
    }));
    // Ensure name/description remain whatever user last typed or reset? Keep existing to allow rapid adds.
    setShowAddDialog(true);
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4 shadow-sm sticky top-0 z-40 hidden lg:block">
        <div className=" mx-auto">
          <div className="flex items-center justify-between mb-4 ">
            <h1 className="text-2xl font-bold text-foreground">
              Tricks Manager
            </h1>
            <span className="text-sm text-muted-foreground">
              <Info className="inline-block mr-1" size={14} />
              As an admin, you can manage tricks by dragging and dropping them
              between difficulty zones or subcategories.
            </span>
            <div className="flex gap-2">
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  // If user clicks header add, just open dialog with defaults
                  setFormData((prev) => ({
                    ...prev,
                    difficulty_level: 1,
                    subcategory_id: "",
                  }));
                  setShowAddDialog(true);
                }}
              >
                <Plus size={16} />
                Add Trick
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Trick</DialogTitle>
                    {/* difficulty and subategory */}
                    <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium flex-wrap">
                      <Select
                        /* Use 'unassigned' sentinel instead of empty string (empty disallowed by SelectItem) */
                        value={
                          formData.subcategory_id
                            ? formData.subcategory_id
                            : "unassigned"
                        }
                        onValueChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            subcategory_id: val === "unassigned" ? "" : val,
                          }))
                        }
                      >
                        <SelectTrigger
                          className="h-auto px-1 py-0 border-none shadow-none bg-transparent hover:bg-transparent focus:ring-0 focus:outline-none w-auto text-foreground [&>svg]:hidden"
                          aria-label="Select subcategory"
                        >
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent side="bottom" align="start">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {[...subcategories]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      -
                      <Select
                        value={String(formData.difficulty_level)}
                        onValueChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty_level: Number(val),
                          }))
                        }
                      >
                        <SelectTrigger
                          className="h-auto px-1 py-0 border-none shadow-none bg-transparent hover:bg-transparent focus:ring-0 focus:outline-none text-sm text-foreground w-auto [&>svg]:hidden"
                          aria-label="Select difficulty level"
                        >
                          <SelectValue
                            placeholder={`Difficulty ${formData.difficulty_level}`}
                          />
                        </SelectTrigger>
                        <SelectContent side="bottom" align="start">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (n) => (
                              <SelectItem key={n} value={String(n)}>
                                Difficulty {n}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter trick name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter trick description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="media_url">Media URL *</Label>
                      <Input
                        id="media_url"
                        type="url"
                        value={formData.media_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, media_url: val }));
                          setDetectedMediaType(classifyMedia(val));
                        }}
                        placeholder="YouTube link or direct image URL"
                      />
                      <p className="text-xs mt-1">
                        {detectedMediaType === "youtube" && (
                          <span className="text-success">
                            Detected: YouTube video ✔
                          </span>
                        )}
                        {detectedMediaType === "image" && (
                          <span className="text-success">
                            Detected: Image ✔
                          </span>
                        )}
                        {detectedMediaType === "unknown" && (
                          <span className="text-muted-foreground">
                            Paste a YouTube watch/share URL or an image (.jpg,
                            .png, .gif, .webp)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddTrick} className="flex-1">
                        {addingTrick ? "Adding..." : "Add Trick"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={saveChanges}
                disabled={modifiedTricks.size === 0 || saving}
                variant={modifiedTricks.size > 0 ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : `Save Changes (${modifiedTricks.size})`}
              </Button>

              <Button
                onClick={resetChanges}
                disabled={modifiedTricks.size === 0}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw size={16} />
                Reset
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap hidden lg:block ">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-6 py-2 rounded-lg border-2 transition-all font-medium mr-2
                  ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-muted-foreground"
                  }
                `}
                style={{
                  borderColor:
                    selectedCategory === category.id
                      ? adjustColorForTheme(category.color || "#3b82f6") ||
                        undefined
                      : undefined,
                  backgroundColor:
                    selectedCategory === category.id
                      ? `${adjustColorForTheme(
                          category.color || "#3b82f6"
                        )}15` || undefined
                      : undefined,
                  color:
                    selectedCategory === category.id
                      ? adjustColorForTheme(category.color || "#3b82f6") ||
                        undefined
                      : undefined,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-2 rounded z-50">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-success/10 border border-success text-success-foreground px-4 py-2 rounded z-50">
          {success}
        </div>
      )}

      {/* Main Content */}
      <div className="hidden lg:block">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium">Loading tricks...</div>
          </div>
        )}

        {!loading && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto lg:max-w-[calc(100vw-290px)] max-w-100vw  ">
              {/* Horizontal scrollable subcategory strip */}
              <div
                ref={scrollContainerRef}
                className="flex items-start gap-6 overflow-x-auto pb-4 pr-2 -mr-2 scrollbar-thin max-h-[calc(100vh-193px)]"
                style={{
                  scrollBehavior: "smooth",
                  overscrollBehavior: "contain",
                }}
                aria-label="Subcategories horizontal list"
                onDragOver={(e) => {
                  // Custom controlled auto-scroll with very slow speed
                  if (!activeId || !scrollContainerRef.current) return;

                  const container = scrollContainerRef.current;
                  const rect = container.getBoundingClientRect();
                  const mouseX = e.clientX;

                  // Define scroll zones (60px from each edge - smaller zones)
                  const scrollZoneSize = 60;
                  const leftZone = rect.left + scrollZoneSize;
                  const rightZone = rect.right - scrollZoneSize;

                  // Calculate scroll speed based on proximity to edge (max 2px per frame - much slower)
                  let scrollSpeed = 0;

                  if (mouseX < leftZone) {
                    // Scroll left
                    const proximity = (leftZone - mouseX) / scrollZoneSize;
                    scrollSpeed = -Math.min(2, proximity * 2);
                  } else if (mouseX > rightZone) {
                    // Scroll right
                    const proximity = (mouseX - rightZone) / scrollZoneSize;
                    scrollSpeed = Math.min(2, proximity * 2);
                  }

                  if (scrollSpeed !== 0) {
                    container.scrollLeft += scrollSpeed;
                  }
                }}
              >
                {/* Subcategory Columns */}
                {subcategories.map((subcategory) => {
                  return (
                    <div
                      key={subcategory.id}
                      className={`h-fit flex-shrink-0 w-72 ${
                        subcategories[0].id !== subcategory.id
                          ? "border-l border-border pl-4"
                          : ""
                      }`}
                    >
                      <div className="pb-3 pt-3">
                        <h3
                          className="text-lg font-semibold text-center tracking-tight"
                          style={{ color: themeAdjustedCategoryColor }}
                        >
                          {subcategory.name}
                        </h3>
                      </div>
                      <div className="px-1">
                        <div className="space-y-3">
                          {difficultyLevels.map((difficulty) => {
                            const difficultyTricks = getTricksForDifficulty(
                              subcategory.id,
                              difficulty
                            );

                            // Only show difficulty zones that have tricks or when dragging
                            if (difficultyTricks.length === 0 && !activeId)
                              return null;

                            return (
                              <DifficultyZone
                                key={difficulty}
                                subcategoryId={subcategory.id}
                                difficulty={difficulty}
                                tricks={difficultyTricks}
                                categoryColor={themeAdjustedCategoryColor}
                                modifiedTricks={modifiedTricks}
                                onAddTrick={openAddTrickAt}
                              />
                            );
                          })}

                          {/* Show empty state when no tricks */}
                          {getTricksForSubcategory(subcategory.id).length ===
                            0 && (
                            <div className="text-center text-muted-foreground py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-3">
                              <span className="text-sm">No tricks yet</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 "
                                onClick={() =>
                                  openAddTrickAt(subcategory.id, 1)
                                }
                              >
                                <Plus size={16} /> Add first trick
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                or drop an existing trick here
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Unassigned Tricks Column */}
                {(getUnassignedTricks().length > 0 || activeId) && (
                  <Card className="h-fit border-dashed border-2 flex-shrink-0 w-72">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-center text-muted-foreground">
                        Unassigned
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {difficultyLevels.map((difficulty) => {
                          const difficultyTricks = getTricksForDifficulty(
                            null,
                            difficulty
                          );

                          // Only show difficulty zones that have tricks or when dragging
                          if (difficultyTricks.length === 0 && !activeId)
                            return null;

                          return (
                            <DifficultyZone
                              key={difficulty}
                              subcategoryId={null}
                              difficulty={difficulty}
                              tricks={difficultyTricks}
                              categoryColor="#6b7280"
                              modifiedTricks={modifiedTricks}
                              onAddTrick={openAddTrickAt}
                            />
                          );
                        })}

                        {/* Show empty state when no tricks and not dragging */}
                        {getUnassignedTricks().length === 0 && !activeId && (
                          <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center gap-3">
                            <span className="text-sm">
                              No unassigned tricks
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                              onClick={() => openAddTrickAt(null, 1)}
                            >
                              <Plus size={16} /> Add new (Diff 1)
                            </Button>
                            <span className="text-xs text-gray-400">
                              or drop an existing trick here
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Orphaned Tricks Section (tricks without difficulty level) */}
              {getOrphanedTricks().length > 0 && (
                <div className="mt-6">
                  <Card className="border-dashed border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Orphaned Tricks (No Difficulty Level)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[100px] p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                          {getOrphanedTricks().map((trick) => (
                            <SortableTrickItem
                              key={trick.id}
                              trick={trick}
                              isModified={modifiedTricks.has(trick.id)}
                              categoryColor="#6b7280"
                            />
                          ))}
                        </div>
                        {getOrphanedTricks().length === 0 && (
                          <div className="text-center text-gray-400 py-4">
                            All tricks have difficulty levels assigned
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeTrick ? (
                <TrickItem
                  trick={activeTrick}
                  categoryColor={themeAdjustedCategoryColor}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Please view on desktop */}
      <div className="lg:hidden p-8 text-center">
        <p className="text-lg font-medium">
          Please view the Tricks Manager on a desktop or laptop for the best
          experience.
        </p>
      </div>
    </div>
  );
}
