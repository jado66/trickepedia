"use client";

import { useState } from "react";
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

interface Product {
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

interface ProductListItemProps {
  product: Product;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onSell: (id: string, quantity: number) => void;
  onRestock: (id: string, quantity: number) => void;
}

export function ProductListItem({
  product,
  onUpdate,
  onDelete,
  onSell,
  onRestock,
}: ProductListItemProps) {
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
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
            {product.category && product.category.trim() !== "" && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {product.category}
              </Badge>
            )}

            {isOutOfStock ? (
              <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 shrink-0">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Out of stock
              </Badge>
            ) : isLowStock ? (
              <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 shrink-0">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Stock
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            <span>Qty: {product.quantity}</span>
            <span>${product.price}</span>
            <span className="text-green-600">{profitMargin}% margin</span>
            {product.supplier && <span>Supplier: {product.supplier}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={product.quantity === 0}
            >
              <ShoppingCart className="w-4 h-4" />
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
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4" />
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
    </div>
  );
}
