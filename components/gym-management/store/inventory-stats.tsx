import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

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

interface InventoryStatsProps {
  products: Product[];
}

export function InventoryStats({ products }: InventoryStatsProps) {
  const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCost = products.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0
  );
  const totalProfit = totalValue - totalCost;

  const lowStockItems = products.filter(
    (item) => item.quantity <= item.reorderLevel
  ).length;

  const outOfStockItems = products.filter((item) => item.quantity === 0).length;

  const stats = [
    {
      title: "Total Products",
      value: totalItems.toString(),
      icon: Package,
      description: `${products.length} unique items`,
    },
    {
      title: "Inventory Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Current retail value",
    },
    {
      title: "Potential Profit",
      value: `$${totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      description: "If all items sold",
      variant: "default" as const,
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      description: `${outOfStockItems} out of stock`,
      variant:
        lowStockItems > 0 ? ("destructive" as const) : ("default" as const),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
