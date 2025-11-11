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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface DeleteCategoryDialogProps {
  open: boolean;
  category: string | null;
  categories: string[]; // other categories
  onOpenChange: (o: boolean) => void;
  onConfirm: (replacement?: string) => void; // reassign to replacement
  onRemoveAll: () => void; // set affected products to Uncategorized
}

export function DeleteCategoryDialog({
  open,
  category,
  categories,
  onOpenChange,
  onConfirm,
  onRemoveAll,
}: DeleteCategoryDialogProps) {
  const [mode, setMode] = useState<"reassign" | "uncategorize">("reassign");
  const [replacement, setReplacement] = useState<string | undefined>(
    categories[0]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete Tag{category ? `: ${category}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This tag is currently assigned to one or more products. Choose how
            you&apos;d like to proceed.
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
                    No other tags available. Switch to &apos;Uncategorize&apos;
                    option.
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
                id="mode-uncategorize"
                type="radio"
                className="h-4 w-4"
                checked={mode === "uncategorize"}
                onChange={() => setMode("uncategorize")}
              />
              <label htmlFor="mode-uncategorize" className="flex-1 text-sm">
                Move products to &apos;Uncategorized&apos;
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
              Uncategorize & Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
