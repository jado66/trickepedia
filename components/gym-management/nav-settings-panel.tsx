"use client";

import React from "react";
// Unified navigation comes from gym-setup-provider now; legacy provider removed
import { useGymManagementNav } from "@/contexts/gym/gym-setup-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// Removed Card layout because this panel now lives inside a Popover and should be visually lighter.

const SortableRow: React.FC<{
  id: string;
  label: string;
  onRemove(): void;
  icon: React.ComponentType<any>;
  beta?: boolean;
}> = ({ id, label, onRemove, icon: Icon, beta }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-2 px-3 rounded border bg-card/50"
    >
      <button
        aria-label="Drag"
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-sm">
        <span className="flex items-center gap-2">
          <span>{label}</span>
          {beta && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              BETA
            </Badge>
          )}
        </span>
      </span>
      {/** keep remove button at end */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove navigation item"
        className="h-6 w-6"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const GymManagementNavSettingsPanel: React.FC = () => {
  const { settings, updateOrder, toggleItem, allItems } = useGymManagementNav();

  const [addOpen, setAddOpen] = React.useState(false);

  // Derive enabled & disabled lists
  const disabledSet = new Set(settings.disabled);
  // Filter out any IDs that don't exist in allItems to prevent undefined errors
  const enabledOrdered = settings.order
    .filter((id) => !disabledSet.has(id))
    .filter((id) => allItems.find((item) => item.id === id));
  const disabledItems = allItems.filter((i) => disabledSet.has(i.id));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = settings.order.indexOf(String(active.id));
    const newIndex = settings.order.indexOf(String(over.id));
    updateOrder(arrayMove(settings.order, oldIndex, newIndex));
  };

  return (
    <div className="w-full p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold leading-none mb-1">
          Customize Apps
        </h2>
        <p className="text-xs text-muted-foreground">
          Drag to reorder. Remove with X. Add hidden apps below.
        </p>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={enabledOrdered}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {enabledOrdered.map((id) => {
              const item = allItems.find((i) => i.id === id);
              // Safety check: skip if item not found
              if (!item) return null;
              return (
                <SortableRow
                  key={id}
                  id={id}
                  label={item.label}
                  beta={item.beta}
                  icon={item.icon}
                  onRemove={() => toggleItem(id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-4 pt-3 border-t">
        <button
          type="button"
          onClick={() => setAddOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left text-sm font-medium"
          aria-expanded={addOpen}
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Apps
            <span className="text-xs font-normal text-muted-foreground">
              ({disabledItems.length} available)
            </span>
          </span>
          {addOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {addOpen && (
          <div className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
            {disabledItems.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">
                All apps are currently visible.
              </p>
            )}
            {disabledItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md border p-3 hover:bg-accent/40 transition"
              >
                <div className="mt-0.5">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-none mb-1">
                    <span className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.beta && (
                        <span className="text-[10px] h-5 px-1.5 inline-flex items-center rounded bg-muted/80 text-muted-foreground">
                          BETA
                        </span>
                      )}
                    </span>
                  </p>
                  {item.description && (
                    <p className="text-[10px] leading-snug text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7 px-2"
                  onClick={() => toggleItem(item.id)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
