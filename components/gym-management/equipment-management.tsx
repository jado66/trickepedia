"use client";

import { useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface EquipmentBasic {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  lastInspection: string;
  nextInspection: string;
  purchaseDate: string;
  warranty: string;
  notes: string;
}

export function EquipmentManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { equipment, addEquipment, removeEquipment, demoMode, limits } =
    useGym();

  const handleAddEquipment = async (formData: FormData) => {
    const purchaseDate = formData.get("purchaseDate") as string;
    const warrantyMonths = Number.parseInt(
      formData.get("warrantyMonths") as string
    );
    const warrantyDate = new Date(purchaseDate);
    warrantyDate.setMonth(warrantyDate.getMonth() + warrantyMonths);
    const res = await addEquipment({
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      status: "excellent",
      lastInspection: new Date().toISOString().split("T")[0],
      nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      purchaseDate: purchaseDate,
      warranty: warrantyDate.toISOString().split("T")[0],
      notes: (formData.get("notes") as string) || "",
    });
    if (!res.success) return alert(res.error);
    setIsAddDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "needs-maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "out-of-service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-3 w-3" />;
      case "needs-maintenance":
        return <Wrench className="h-3 w-3" />;
      case "out-of-service":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <span>Equipment Management</span>
            <Badge variant="secondary" className="ml-3 text-xs uppercase">
              Beta
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Track equipment status, maintenance, and safety inspections
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={demoMode && equipment.length >= limits.equipment}>
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && equipment.length >= limits.equipment
                ? "Demo Limit"
                : "Add Equipment"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>
                Register new equipment for tracking and maintenance.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAddEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Balance Beam - Competition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gymnastics">Gymnastics</SelectItem>
                      <SelectItem value="Parkour">Parkour</SelectItem>
                      <SelectItem value="Tumbling">Tumbling</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Mats">Mats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select name="location" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Gym">Main Gym</SelectItem>
                      <SelectItem value="Tumbling Area">
                        Tumbling Area
                      </SelectItem>
                      <SelectItem value="Parkour Zone">Parkour Zone</SelectItem>
                      <SelectItem value="Fitness Area">Fitness Area</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    name="purchaseDate"
                    type="date"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Warranty Period (months)</Label>
                <Input
                  id="warrantyMonths"
                  name="warrantyMonths"
                  type="number"
                  placeholder="24"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special notes about this equipment..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Equipment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {equipment.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">
                        {item.status.replace("-", " ")}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Location: {item.location}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Last Inspection</p>
                      <p className="text-muted-foreground">
                        {new Date(item.lastInspection).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Next Inspection</p>
                      <p className="text-muted-foreground">
                        {new Date(item.nextInspection).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Purchase Date</p>
                      <p className="text-muted-foreground">
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Warranty</p>
                      <p className="text-muted-foreground">
                        {item.warranty === "Expired"
                          ? "Expired"
                          : `Until ${new Date(
                              item.warranty
                            ).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{item.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Inspection
                    </Button>
                    <Button variant="outline" size="sm">
                      <Wrench className="h-4 w-4 mr-2" />
                      Log Maintenance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEquipment(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
