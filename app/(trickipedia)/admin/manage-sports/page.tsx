"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// (Card components removed for compact row layout)
import { Badge } from "@/components/ui/badge";
import {
  getAllMasterCategories,
  deleteMasterCategory,
  bulkUpdateMasterCategoryOrder,
  type MasterCategory,
} from "@/lib/client/categories-data-client";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  SettingsIcon,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryFormDialog } from "@/components/category-form-dialog";
import Link from "next/link";
import { iconMap } from "@/components/side-nav";

// Helper to map stored icon names to Lucide components
function getIconComponent(iconName: string): React.ComponentType<any> {
  return iconMap[iconName];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllMasterCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMasterCategory(id);
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleEdit = (category: MasterCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus = showInactive || category.is_active;
    return matchesSearch && matchesStatus;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredCategories.findIndex(
      (c) => c.id === String(active.id)
    );
    const newIndex = filteredCategories.findIndex(
      (c) => c.id === String(over.id)
    );
    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder within filtered list then map back to full list preserving unfiltered items order
    const reorderedFiltered = arrayMove(filteredCategories, oldIndex, newIndex);
    const reorderedAll = categories
      .slice()
      .sort((a, b) => {
        const ai = reorderedFiltered.findIndex((r) => r.id === a.id);
        const bi = reorderedFiltered.findIndex((r) => r.id === b.id);
        if (ai === -1 && bi === -1) return a.sort_order - b.sort_order; // neither filtered
        if (ai === -1) return 1; // put unfiltered after filtered to avoid destabilizing relative order
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map((c, i) => ({ ...c, sort_order: i + 1 }));

    const original = categories;
    setCategories(reorderedAll);

    // Determine changed rows
    const changed = reorderedAll.filter(
      (c, i) =>
        c.id !== original[i]?.id || c.sort_order !== original[i]?.sort_order
    );
    if (changed.length === 0) return;
    setSavingOrder(true);
    try {
      await bulkUpdateMasterCategoryOrder(
        changed.map((c) => ({ id: c.id, sort_order: c.sort_order }))
      );
    } catch (err) {
      console.error(
        "Failed to persist master category order, rolling back",
        err
      );
      setCategories(original);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Manage Sports &amp; Disciplines
            </h1>
            <p className="text-muted-foreground">
              Create and manage movement discipline categories
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Sport
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-2"
          >
            {showInactive ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showInactive ? "Hide Unlisted" : "Show All"}
          </Button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {filteredCategories.map((category) => (
                  <SortableCategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => handleEdit(category)}
                    onDelete={() => handleDelete(category.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        {savingOrder && (
          <div className="text-xs text-muted-foreground mt-2 animate-pulse">
            Saving order…
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No categories found matching "${searchQuery}"`
                : "No categories found"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </main>

      <CategoryFormDialog
        category={editingCategory}
        open={isFormOpen}
        onClose={handleFormClose}
      />
    </div>
  );
}

function SortableCategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: MasterCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const IconComponent = getIconComponent(category.icon_name || "circle");
  const rawStatus = String(category.status || "");
  const isHidden = rawStatus === "hidden" || !category.is_active;
  const isBeta =
    !isHidden && ["in-progress", "in_progress"].includes(rawStatus);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-md border bg-card px-3 py-2 shadow-sm hover:bg-accent/30 transition-colors text-sm `}
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

      {/* Icon */}
      <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0">
        <IconComponent className="h-5 w-5 " />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate max-w-[160px] md:max-w-[240px]">
            {category.name}
          </span>
          <Badge variant="outline" className="font-mono lowercase">
            /{category.slug}
          </Badge>
          {/* Status / Visibility Badges */}
          {isBeta && (
            <Badge className="bg-amber-500/20 text-amber-700 border border-amber-400 font-medium">
              Beta
            </Badge>
          )}
          {isHidden && (
            <Badge
              variant="secondary"
              className="font-mono tracking-wide uppercase"
            >
              Unlisted
            </Badge>
          )}

          <span className="text-xs text-muted-foreground">
            #{category.sort_order}
          </span>
        </div>
        {category.description && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {category.description}
          </div>
        )}
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
        <Link href={`/admin/${category.slug}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            title="Manage Trick Categories"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
