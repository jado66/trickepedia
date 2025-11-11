"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  ShoppingCart,
  Package,
} from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onSell: (id: string, quantity: number) => void;
  onRestock: (id: string, quantity: number) => void;
}

export function ProductCard({
  product,
  onUpdate,
  onDelete,
  onSell,
  onRestock,
}: ProductCardProps) {
  const [sellQuantity, setSellQuantity] = useState(1);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);

  const isLowStock = product.quantity <= product.reorderLevel;
  const isOutOfStock = product.quantity === 0;
  const profitMargin = (
    ((product.price - product.cost) / product.price) *
    100
  ).toFixed(1);

  const handleSell = () => {
    if (sellQuantity > 0 && sellQuantity <= product.quantity) {
      onSell(product.id, sellQuantity);
      setSellQuantity(1);
      setIsSellDialogOpen(false);
    }
  };

  const handleRestock = () => {
    if (restockQuantity > 0) {
      onRestock(product.id, restockQuantity);
      setRestockQuantity(1);
      setIsRestockDialogOpen(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-balance">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {product.category && product.category.trim() !== "" && (
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              )}

              {isOutOfStock ? (
                <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Out of stock
                </Badge>
              ) : isLowStock ? (
                <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Low Stock
                </Badge>
              ) : null}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <p className="font-medium">{product.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span>
            <p className="font-medium">${product.price}</p>
          </div>
          <div>
            <span className="text-muted-foreground">SKU:</span>
            <p className="font-medium">{product.sku}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Margin:</span>
            <p className="font-medium text-green-600">{profitMargin}%</p>
          </div>
        </div>

        {product.supplier && (
          <div className="text-sm">
            <span className="text-muted-foreground">Supplier:</span>
            <p className="font-medium">{product.supplier}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                disabled={product.quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Sell
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sell {product.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Quantity to sell (Available: {product.quantity})
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={sellQuantity}
                    onChange={(e) =>
                      setSellQuantity(Number.parseInt(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSellDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSell}>
                    Sell {sellQuantity} item{sellQuantity !== 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isRestockDialogOpen}
            onOpenChange={setIsRestockDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <Package className="w-4 h-4 mr-1" />
                Restock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restock {product.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quantity to add</label>
                  <Input
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) =>
                      setRestockQuantity(Number.parseInt(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRestockDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRestock}>
                    Add {restockQuantity} item{restockQuantity !== 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {product.description && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            {product.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
