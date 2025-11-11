"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Plus } from "lucide-react";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRenameCategory: (oldCat: string, newCat: string) => void;
  onDeleteCategory: (category: string) => void;
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: ManageCategoriesDialogProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (cat: string) => {
    setEditing(cat);
    setEditValue(cat);
  };

  const saveEdit = () => {
    if (editing && editValue.trim() && editValue !== editing) {
      onRenameCategory(editing, editValue.trim());
    }
    setEditing(null);
    setEditValue("");
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setNewCategory("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory();
              }}
            />
            <Button onClick={addCategory} disabled={!newCategory.trim()}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <ScrollArea className="h-64 pr-4">
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat} className="flex items-center gap-2 group">
                  {editing === cat ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") {
                            setEditing(null);
                            setEditValue("");
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={saveEdit}
                        className="h-8 px-3"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(null);
                          setEditValue("");
                        }}
                        className="h-8 px-3"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 capitalize text-sm">{cat}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition"
                        onClick={() => onDeleteCategory(cat)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
