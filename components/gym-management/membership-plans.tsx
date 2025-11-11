"use client";
import React, { useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { MembershipPlan } from "@/types/gym-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const MembershipPlans: React.FC = () => {
  const {
    membershipPlans,
    addMembershipPlan,
    updateMembershipPlan,
    removeMembershipPlan,
    demoMode,
    limits,
  } = useGym();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);

  const onSubmit = async (formData: FormData) => {
    const payload = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      billingInterval: formData.get("billingInterval") as any,
      description: (formData.get("description") as string) || "",
      status: formData.get("status") as string as any,
    };
    if (editing) {
      const res = await updateMembershipPlan(editing.id, {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      if (!res.success) return alert(res.error);
    } else {
      const res = await addMembershipPlan(payload as any);
      if (!res.success) return alert(res.error);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Membership Plans</h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
            setOpen(o);
          }}
        >
          <DialogTrigger asChild>
            <Button
              disabled={
                demoMode && membershipPlans.length >= limits.membershipPlans
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && membershipPlans.length >= limits.membershipPlans
                ? "Demo Limit"
                : editing
                ? "Edit Plan"
                : "New Plan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Membership Plan" : "Add Membership Plan"}
              </DialogTitle>
            </DialogHeader>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={editing?.price}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingInterval">Billing Interval</Label>
                  <select
                    id="billingInterval"
                    name="billingInterval"
                    defaultValue={editing?.billingInterval || "monthly"}
                    className="border rounded h-9 px-2 w-full"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="session">Per Session</option>
                    <option value="one-time">One Time</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editing?.status || "active"}
                  className="border rounded h-9 px-2 w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description}
                  placeholder="Describe the plan benefits..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? "Save Changes" : "Create Plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membershipPlans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-6"
                >
                  No membership plans yet.
                </TableCell>
              </TableRow>
            ) : (
              membershipPlans.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">
                    {p.billingInterval.replace("-", " ")}
                  </TableCell>
                  <TableCell className="capitalize">{p.status}</TableCell>
                  <TableCell
                    className="max-w-xs truncate"
                    title={p.description}
                  >
                    {p.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMembershipPlan(p.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
