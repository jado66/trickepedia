"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  getSubcategoriesByMasterCategory,
  type Subcategory,
} from "@/lib/client/subcategories-data-client";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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
import { SubcategoryFormDialog } from "@/components/subcategory-form-dialog";
import { getMasterCategoryBySlug } from "@/lib/client/categories-data-client";
import Link from "next/link";
import { deleteSubcategory } from "@/lib/client/subcategories-data-client";
import { supabase } from "@/utils/supabase/client";

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export default function AdminSubcategoriesPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [masterCategory, setMasterCategory] = useState<MasterCategory | null>(
    null
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    if (slug) {
      loadData();
    }
  }, [slug, supabase]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load master category first
      const categoryData = await getMasterCategoryBySlug(slug);
      if (!categoryData) {
        // Handle category not found - you might want to redirect or show an error
        console.error("Category not found:", slug);
        return;
      }
      setMasterCategory(categoryData);

      // Load subcategories for this category
      const subcategoriesData = await getSubcategoriesByMasterCategory(
        supabase,
        categoryData.id
      );
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async () => {
    if (!masterCategory) return;

    if (!supabase) {
      console.error("Supabase client not initialized");
      return;
    }

    try {
      const data = await getSubcategoriesByMasterCategory(
        supabase,
        masterCategory.id
      );
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    }
  };

  // Enhanced version of your handleDelete function
  const handleDelete = async (id: string) => {
    console.log("handleDelete called with ID:", id);

    try {
      await deleteSubcategory(supabase, id);
      console.log("Delete completed, reloading subcategories...");
      await loadSubcategories();
      console.log("Subcategories reloaded");
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      // Consider adding user-facing error handling here
      alert(
        `Failed to delete subcategory: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingSubcategory(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubcategory(null);
    loadSubcategories();
  };

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const matchesSearch =
      subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subcategory.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    const matchesStatus = showInactive || subcategory.is_active;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!masterCategory) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground">
              The category &quote;{slug}&quote; could not be found.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: masterCategory.color || "#164e63",
                }}
              />
              <h1 className="text-3xl font-bold">
                {masterCategory.name} Trick Categories
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage trick categories for {masterCategory.name}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search trick categories..."
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
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{subcategories.length}</div>
              <p className="text-sm text-muted-foreground">
                Total Trick Categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {subcategories.filter((s) => s.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground">
                Active Trick Categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {subcategories.reduce(
                  (sum, s) => sum + (s.trick_count || 0),
                  0
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Tricks</p>
            </CardContent>
          </Card>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
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
                      variant={subcategory.is_active ? "default" : "secondary"}
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
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {subcategory.trick_count || 0} tricks
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(subcategory)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Link href={`/${slug}/${subcategory.slug}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Tricks
                    </Button>
                  </Link>
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
                        <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {subcategory.name}
                          &quot;? This action cannot be undone and will affect
                          all associated tricks.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(subcategory.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubcategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No subcategories found matching "${searchQuery}"`
                : `No subcategories found for ${masterCategory.name}`}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            ) : (
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Subcategory
              </Button>
            )}
          </div>
        )}
      </main>

      <SubcategoryFormDialog
        subcategory={editingSubcategory}
        masterCategoryId={masterCategory.id}
        open={isFormOpen}
        onClose={handleFormClose}
      />
    </div>
  );
}
