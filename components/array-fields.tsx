"use client";

import type React from "react";
// import { Input, Button, Badge, Label } from "./ui";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

import {
  Plus,
  Trash2,
  ExternalLink,
  Video,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ArrayFieldProps {
  title: string;
  field: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: "text" | "url";
  items: string[];
  mode: "view" | "edit" | "create";
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddItem: (field: string) => void;
  onRemoveItem: (field: string, index: number) => void;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function ArrayField({
  title,
  field,
  placeholder,
  icon,
  type = "text",
  items,
  mode,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}: ArrayFieldProps) {
  const nonEmptyItems = items.filter(Boolean);
  const validItems =
    type === "url" ? nonEmptyItems.filter(isValidUrl) : nonEmptyItems;

  if (mode === "view" && nonEmptyItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <Label className="text-sm font-medium">{title}</Label>
        {nonEmptyItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {nonEmptyItems.length}
            </Badge>
            {type === "url" && validItems.length !== nonEmptyItems.length && (
              <Badge variant="destructive" className="text-xs">
                {nonEmptyItems.length - validItems.length} invalid
              </Badge>
            )}
          </div>
        )}
      </div>

      {mode === "edit" || mode === "create" ? (
        <div className="space-y-2">
          {items.map((item, index) => {
            const isValid = type !== "url" || !item.trim() || isValidUrl(item);

            return (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={type}
                    value={item}
                    onChange={(e) =>
                      onArrayChange(field, index, e.target.value)
                    }
                    placeholder={placeholder}
                    className={`pr-8 ${
                      !isValid ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {/* URL validation indicator */}
                  {type === "url" && item.trim() && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {type === "url" && item.trim() && isValid && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item, "_blank")}
                    className="px-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(field, index)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddItem(field)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {field === "tags" ? (
            <div className="flex flex-wrap gap-2">
              {nonEmptyItems.map((item, idx) => (
                <Badge key={idx} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          ) : field === "video_urls" ? (
            <div className="space-y-2">
              {nonEmptyItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex-1 truncate"
                  >
                    {item}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {nonEmptyItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
