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
} from "@/lib/client/subcategories-data-client";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white hover:border-gray-400"
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center py-12">Loading...</div>
          )}

          {!loading &&
            filtered.map((subcategory) => (
              <Card
                key={subcategory.id}
                className={`${!subcategory.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {subcategory.name}
                      </CardTitle>
                      <Badge
                        variant={
                          subcategory.is_active ? "default" : "secondary"
                        }
                        className="mb-2"
                      >
                        {subcategory.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {subcategory.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Slug:</span>{" "}
                      {subcategory.slug}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Order:</span>{" "}
                      {subcategory.sort_order}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(subcategory);
                        setIsFormOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Subcategory
                          </AlertDialogTitle>
                          <div className="text-sm text-muted-foreground">
                            Are you sure you want to delete &quot;
                            {subcategory.name}
                            &quot;? This cannot be undone.
                          </div>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subcategory.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
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
