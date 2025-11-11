"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserIcon } from "lucide-react";
import type { TrickFormSectionProps, InventorType } from "@/types/trick-form";

interface InventorSectionProps extends TrickFormSectionProps {
  inventorType: InventorType;
  onInventorTypeChange: (type: InventorType) => void;
  getInventorDisplayName: () => string | null;
}

export function InventorSection({
  formData,
  mode,
  onFieldChange,
  users = [],
  inventorType,
  onInventorTypeChange,
  getInventorDisplayName,
}: InventorSectionProps) {
  return (
    <AccordionItem value="inventor" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Trick Inventor</h3>
            <p className="text-sm text-muted-foreground">
              Credit the person who created this trick
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        {mode === "view" ? (
          getInventorDisplayName() && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Invented by:{" "}
                </span>
                <span className="font-medium">{getInventorDisplayName()}</span>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <Select
              value={inventorType}
              onValueChange={(value: InventorType) =>
                onInventorTypeChange(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No inventor specified</SelectItem>
                <SelectItem value="user">Select registered user</SelectItem>
                <SelectItem value="name">Enter inventor name</SelectItem>
              </SelectContent>
            </Select>

            {inventorType === "user" && (
              <Select
                value={formData.inventor_user_id || ""}
                onValueChange={(value) =>
                  onFieldChange("inventor_user_id", value || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || `${user.first_name} ${user.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {inventorType === "name" && (
              <Input
                value={formData.inventor_name || ""}
                onChange={(e) => onFieldChange("inventor_name", e.target.value)}
                placeholder="Enter inventor name"
              />
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
