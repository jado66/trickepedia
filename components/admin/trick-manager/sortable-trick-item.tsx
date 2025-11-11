"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Trick } from "@/types/trick-manager";

export function SortableTrickItem({
  trick,
  isModified,
  categoryColor,
}: {
  trick: Trick;
  isModified: boolean;
  categoryColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trick.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-3 rounded-lg border-2 cursor-move transition-all relative
        ${isDragging ? "opacity-50 z-50" : ""}
        ${
          isModified
            ? "bg-warning/10 border-warning shadow-lg"
            : "bg-card border-border hover:border-muted-foreground shadow-sm hover:shadow-md"
        }
      `}
    >
      {isModified && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
          !
        </div>
      )}
      <div className="font-semibold text-sm mb-1 text-foreground">
        {trick.name}
      </div>
    </div>
  );
}
