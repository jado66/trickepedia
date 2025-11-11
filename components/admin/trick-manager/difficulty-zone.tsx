"use client";
import { useDroppable } from "@dnd-kit/core";

import { Trick } from "@/types/trick-manager";
import { SortableTrickItem } from "./sortable-trick-item";

export function DifficultyZone({
  subcategoryId,
  difficulty,
  tricks,
  categoryColor,
  modifiedTricks,
  onAddTrick,
}: {
  subcategoryId: string | null;
  difficulty: number;
  tricks: Trick[];
  categoryColor: string;
  modifiedTricks: Map<
    string,
    { subcategory_id?: string; difficulty_level?: number }
  >;
  onAddTrick: (subcategoryId: string | null, difficulty: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${subcategoryId || "unassigned"}-difficulty-${difficulty}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[60px] p-2 rounded-lg border-2 border-dashed transition-all
        ${isOver ? "border-primary bg-primary/10" : "border-border bg-muted/50"}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-muted-foreground text-center w-full">
          Difficulty {difficulty}
        </div>
        <button
          type="button"
          onClick={() => onAddTrick(subcategoryId, difficulty)}
          title="Add trick here"
          className="ml-2 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-border text-muted-foreground hover:bg-card hover:text-foreground hover:border-muted-foreground text-[10px] font-bold leading-none"
        >
          +
        </button>
      </div>
      <div className="space-y-2">
        {tricks.map((trick) => (
          <SortableTrickItem
            key={trick.id}
            trick={trick}
            isModified={modifiedTricks.has(trick.id)}
            categoryColor={categoryColor}
          />
        ))}
      </div>
    </div>
  );
}
