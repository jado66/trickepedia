"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAllMasterCategories,
  type MasterCategory,
} from "@/lib/client/categories-data-client";
import {
  getSubcategoriesByMasterCategory,
  type Subcategory,
  deleteSubcategory,
  updateSubcategory,
  bulkUpdateSubcategoryOrder,
} from "@/lib/client/subcategories-data-client";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SubcategoryFormDialog } from "@/components/subcategory-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/utils/supabase/client";

export default function ModeratorCategoriesPage() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) loadSubcategories(selectedCategoryId);
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const data = await getAllMasterCategories();
      setCategories(data);

      console.log("Fetched categories:", data);

      if (data.length > 0) setSelectedCategoryId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubcategories = async (masterCategoryId: string) => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return;
    }

    setLoading(true);
    try {
      const data = await getSubcategoriesByMasterCategory(
        supabase,
        masterCategoryId,
        true
      );
      setSubcategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return;
    }

    try {
      await deleteSubcategory(supabase, id);
      if (selectedCategoryId) await loadSubcategories(selectedCategoryId);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subcategories.findIndex((s) => s.id === String(active.id));
    const newIndex = subcategories.findIndex((s) => s.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const original = subcategories;
    const reordered = arrayMove(subcategories, oldIndex, newIndex);
    const withNewSort = reordered.map((s, i) => ({ ...s, sort_order: i + 1 }));
    setSubcategories(withNewSort);

    // Determine which actually changed sort_order
    const changed = withNewSort.filter(
      (s, i) =>
        s.sort_order !== original[i]?.sort_order || s.id !== original[i]?.id
    );
    if (changed.length === 0) return;

    setSavingOrder(true);
    try {
      await bulkUpdateSubcategoryOrder(
        supabase,
        changed.map((c) => ({
          id: c.id,
          sort_order: c.sort_order,
          master_category_id: c.master_category_id,
        }))
      );
    } catch (err) {
      console.error("Failed to persist new order, rolling back:", err);
      // Rollback to original state if failure
      setSubcategories(original);
    } finally {
      setSavingOrder(false);
    }
  };

  const filtered = subcategories.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Moderator — Subcategory Manager
            </h1>
            <p className="text-muted-foreground">
              Choose a discipline below to manage its trick categories.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                  selectedCategoryId === c.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-muted-foreground text-foreground"
                }`}
                style={{
                  borderColor:
                    selectedCategoryId === c.id
                      ? c.color || undefined
                      : undefined,
                  backgroundColor:
                    selectedCategoryId === c.id
                      ? `${c.color}15` || undefined
                      : undefined,
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Draggable List */}
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filtered.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {loading && <div className="text-center py-12">Loading...</div>}
              {!loading &&
                filtered.map((subcategory) => (
                  <SortableRow
                    key={subcategory.id}
                    subcategory={subcategory}
                    onEdit={() => {
                      setEditing(subcategory);
                      setIsFormOpen(true);
                    }}
                    onDelete={() => handleDelete(subcategory.id)}
                  />
                ))}
            </SortableContext>
          </DndContext>
          {savingOrder && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Saving order…
            </div>
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? `No categories match "${searchQuery}"`
                : "No categories found for this discipline."}
            </p>
            <Button
              onClick={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        )}
      </main>

      <SubcategoryFormDialog
        subcategory={editing}
        masterCategoryId={selectedCategoryId}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
          if (selectedCategoryId) loadSubcategories(selectedCategoryId);
        }}
      />
    </div>
  );
}

function SortableRow({
  subcategory,
  onEdit,
  onDelete,
}: {
  subcategory: Subcategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: subcategory.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-stretch gap-3 rounded-md border bg-card px-3 py-2 shadow-sm hover:bg-accent/30 transition-colors text-sm ${
        !subcategory.is_active ? "opacity-60" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing flex items-center pr-2 text-muted-foreground hover:text-foreground"
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-70"
        >
          <circle cx="5" cy="5" r="1.5" fill="currentColor" />
          <circle cx="5" cy="10" r="1.5" fill="currentColor" />
          <circle cx="5" cy="15" r="1.5" fill="currentColor" />
          <circle cx="10" cy="5" r="1.5" fill="currentColor" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <circle cx="10" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </button>
      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{subcategory.name}</span>

          <Badge variant="destructive">/{subcategory.slug}</Badge>

          {subcategory.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {subcategory.description}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-0.5"></div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
              <div className="text-sm text-muted-foreground">
                Delete &quot;{subcategory.name}&quot;? This cannot be undone.
              </div>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
