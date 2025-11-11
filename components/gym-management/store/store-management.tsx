"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Package,
  Grid3X3,
  List,
  Tags,
  Filter,
} from "lucide-react";
import { ProductCard } from "@/components/gym-management/store/product-card";
import { InventoryStats } from "@/components/gym-management/store/inventory-stats";
import { AddProductDialog } from "./add-product-dialog";
import { ProductListItem } from "./product-list-item";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ManageCategoriesDialog } from "./manage-categories-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  initGymDB,
  getAll,
  putItem,
  deleteItem as idbDelete,
  clearStore,
  STORE,
  bulkPut,
} from "@/contexts/gym/gym-db";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
  sku: string;
  supplier?: string;
  reorderLevel: number;
  description?: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Protein Powder - Vanilla",
    category: "Supplements",
    quantity: 45,
    price: 49.99,
    cost: 25.0,
    sku: "PROT-VAN-001",
    supplier: "NutriCorp",
    reorderLevel: 10,
    description: "Premium whey protein powder, vanilla flavor",
  },
  {
    id: "2",
    name: "Resistance Bands Set",
    category: "Accessories",
    quantity: 23,
    price: 29.99,
    cost: 12.5,
    sku: "BAND-SET-001",
    supplier: "FitGear Inc",
    reorderLevel: 5,
    description: "Complete set of resistance bands with handles",
  },
  {
    id: "3",
    name: "Gym Water Bottle",
    category: "Accessories",
    quantity: 67,
    price: 19.99,
    cost: 8.0,
    sku: "BOTTLE-001",
    supplier: "HydroFit",
    reorderLevel: 15,
    description: "32oz stainless steel water bottle",
  },
  {
    id: "4",
    name: "Pre-Workout Energy",
    category: "Supplements",
    quantity: 8,
    price: 39.99,
    cost: 18.0,
    sku: "PREWORK-001",
    supplier: "NutriCorp",
    reorderLevel: 12,
    description: "High-energy pre-workout supplement",
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    category: "Equipment",
    quantity: 15,
    price: 79.99,
    cost: 35.0,
    sku: "YOGA-PREM-001",
    supplier: "ZenFit",
    reorderLevel: 8,
    description: "Premium non-slip yoga mat, 6mm thick",
  },
];

// Inline DeleteCategoryDialog to avoid module resolution issues
function DeleteCategoryDialog({
  open,
  category,
  categories,
  onOpenChange,
  onConfirm,
  onRemoveAll,
}: {
  open: boolean;
  category: string | null;
  categories: string[];
  onOpenChange: (o: boolean) => void;
  onConfirm: (replacement?: string) => void; // reassign to another tag
  onRemoveAll: () => void; // strip tag from products entirely
}) {
  const [mode, setMode] = useState<"reassign" | "remove">("reassign");
  const [replacement, setReplacement] = useState<string | undefined>(
    categories[0]
  );
  // Reset replacement when categories list changes (e.g., category removed)
  useEffect(() => {
    if (
      categories.length &&
      (!replacement || !categories.includes(replacement))
    ) {
      setReplacement(categories[0]);
    }
  }, [categories, replacement]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete Tag{category ? `: ${category}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This tag is assigned to products. Choose how to proceed.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="mode-reassign"
                type="radio"
                className="h-4 w-4"
                checked={mode === "reassign"}
                onChange={() => setMode("reassign")}
              />
              <label htmlFor="mode-reassign" className="flex-1 text-sm">
                Reassign products to another tag
              </label>
            </div>
            {mode === "reassign" && (
              <div className="pl-7">
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No other tags available. Use &apos;Uncategorize&apos;
                    instead.
                  </p>
                ) : (
                  <Select
                    value={replacement}
                    onValueChange={(v) => setReplacement(v)}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select replacement" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                id="mode-remove"
                type="radio"
                className="h-4 w-4"
                checked={mode === "remove"}
                onChange={() => setMode("remove")}
              />
              <label htmlFor="mode-remove" className="flex-1 text-sm">
                Remove this tag from products (they will have no tag)
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === "reassign" ? (
            <Button
              disabled={!replacement || categories.length === 0}
              onClick={() => onConfirm(replacement)}
            >
              Reassign & Delete
            </Button>
          ) : (
            <Button variant="destructive" onClick={onRemoveAll}>
              Delete Tag
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InventoryManagement() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  // Categories (editable). Initialize from initial products.
  const [categories, setCategories] = useState<string[]>(() =>
    Array.from(
      new Set(
        initialProducts
          .map((p) => p.category)
          .filter((c) => c && c.trim() !== "")
      )
    )
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStockFilter, setSelectedStockFilter] = useState<
    "all" | "low" | "out"
  >("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [showReassign, setShowReassign] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "inventory-view-mode",
    "grid"
  );

  // Load products from IndexedDB once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initGymDB();
        const existing = await getAll<Product>(STORE.products);
        if (cancelled) return;
        if (existing && existing.length) {
          setProducts(existing);
        } else {
          // Seed initial products into DB
          await Promise.all(
            initialProducts.map((p) => putItem(STORE.products, p))
          );
        }
      } catch (e) {
        // swallow; stay with in-memory initialProducts
        // console.warn("Inventory load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep categories synced with products
  useEffect(() => {
    const dynamic = Array.from(
      new Set(
        products.map((p) => p.category).filter((c) => c && c.trim() !== "")
      )
    );
    setCategories((prev) =>
      Array.from(
        new Set([...dynamic]) // derive solely from products to avoid drift
      )
    );
  }, [products]);

  // Listen for global gym setup reset to also purge inventory
  useEffect(() => {
    const handler = async () => {
      try {
        await clearStore(STORE.products);
        // Reseed
        await Promise.all(
          initialProducts.map((p) => putItem(STORE.products, p))
        );
        setProducts(initialProducts);
        setSelectedCategory("all");
      } catch {
        setProducts(initialProducts);
      }
    };
    window.addEventListener("gym:setup:reset", handler as any);
    return () => window.removeEventListener("gym:setup:reset", handler as any);
  }, []);

  const filteredProducts = products.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      (item.supplier && item.supplier.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesStock =
      selectedStockFilter === "all" ||
      (selectedStockFilter === "low" &&
        item.quantity > 0 &&
        item.quantity <= item.reorderLevel) ||
      (selectedStockFilter === "out" && item.quantity === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = async (newProduct: Omit<Product, "id">) => {
    const product_with_id = { ...newProduct, id: crypto.randomUUID() };
    setProducts((prev) => [...prev, product_with_id]);
    try {
      await putItem(STORE.products, product_with_id);
    } catch {}
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    try {
      const updated = products.find((p) => p.id === id);
      if (updated) await putItem(STORE.products, { ...updated, ...updates });
    } catch {}
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    try {
      await idbDelete(STORE.products, id);
    } catch {}
  };

  const handleSellProduct = async (id: string, quantity: number) => {
    let updatedItem: Product | undefined;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            quantity: Math.max(0, item.quantity - quantity),
          };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      try {
        await putItem(STORE.products, updatedItem);
      } catch {}
    }
  };

  const handleRestockProduct = async (id: string, quantity: number) => {
    let updatedItem: Product | undefined;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, quantity: item.quantity + quantity };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      try {
        await putItem(STORE.products, updatedItem);
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Processing</h2>
          <p className="text-muted-foreground">
            Manage payments, invoices, and billing
          </p>
        </div>
      </div>
      <InventoryStats products={products} />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Store Inventory
              </CardTitle>
              <CardDescription>
                Manage and track all store products
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageCategoriesOpen(true)}
                className="h-8"
              >
                <Tags className="w-4 h-4 mr-2" /> Manage Tags
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="sm:w-[200px]">
                  <Tags className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories
                    .filter((c) => c && c.trim() !== "")
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedStockFilter}
                onValueChange={(v: any) => setSelectedStockFilter(v)}
              >
                <SelectTrigger className="sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                  onSell={handleSellProduct}
                  onRestock={handleRestockProduct}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((item) => (
                <ProductListItem
                  key={item.id}
                  product={item}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                  onSell={handleSellProduct}
                  onRestock={handleRestockProduct}
                />
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by adding your first product"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddProduct}
      />
      <ManageCategoriesDialog
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        categories={categories}
        onAddCategory={(cat) => {
          if (!categories.includes(cat))
            setCategories((prev) => [...prev, cat]);
        }}
        onRenameCategory={(oldCat, newCat) => {
          if (!newCat || oldCat === newCat) return;
          // Update products and persist
          setProducts((prev) => {
            const updated = prev.map((p) =>
              p.category === oldCat ? { ...p, category: newCat } : p
            );
            // Persist only those changed
            const changed = updated.filter(
              (p, idx) => prev[idx].category !== p.category
            );
            if (changed.length) {
              // Fire and forget bulkPut
              bulkPut(STORE.products, changed as any).catch(() => {});
            }
            return updated;
          });
          if (selectedCategory === oldCat) setSelectedCategory(newCat);
        }}
        onDeleteCategory={(cat) => {
          const inUse = products.some((p) => p.category === cat);
          if (inUse) {
            setDeleteCategory(cat);
            setShowReassign(true);
          } else {
            setCategories((prev) => prev.filter((c) => c !== cat));
            if (selectedCategory === cat) setSelectedCategory("all");
          }
        }}
      />
      <DeleteCategoryDialog
        open={showReassign && !!deleteCategory}
        category={deleteCategory}
        categories={categories.filter((c) => c !== deleteCategory)}
        onOpenChange={(o) => {
          if (!o) {
            setShowReassign(false);
            setDeleteCategory(null);
          }
        }}
        onConfirm={(replacement) => {
          const cat = deleteCategory;
          if (!cat) return;
          const replacementCat = replacement!;
          // Ensure replacement exists (should already)
          setCategories((prev) => prev.filter((c) => c !== cat));
          setProducts((prev) => {
            const updated = prev.map((p) =>
              p.category === cat ? { ...p, category: replacementCat } : p
            );
            const changed = updated.filter(
              (p, idx) => prev[idx].category !== p.category
            );
            if (changed.length) {
              bulkPut(STORE.products, changed as any).catch(() => {});
            }
            return updated;
          });
          if (selectedCategory === cat) setSelectedCategory(replacementCat);
          setDeleteCategory(null);
          setShowReassign(false);
        }}
        onRemoveAll={() => {
          const cat = deleteCategory;
          if (!cat) return;
          // Remove category and strip from products (empty string)
          setCategories((prev) => prev.filter((c) => c !== cat));
          setProducts((prev) => {
            const updated = prev.map((p) =>
              p.category === cat ? { ...p, category: "" } : p
            );
            const changed = updated.filter(
              (p, idx) => prev[idx].category !== p.category
            );
            if (changed.length) {
              bulkPut(STORE.products, changed as any).catch(() => {});
            }
            return updated;
          });
          if (selectedCategory === cat) setSelectedCategory("all");
          setDeleteCategory(null);
          setShowReassign(false);
        }}
      />
    </div>
  );
}
