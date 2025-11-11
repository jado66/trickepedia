"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventUpsertDialog } from "@/components/events/event-upsert-dialog";

// Wrapper now delegates to unified EventUpsertDialog

interface CreateEventDialogProps {
  categoryId: string;
  categorySlug: string;
  moveName: string;
  trigger?: React.ReactNode;
}

export function CreateEventDialog({
  categoryId,
  categorySlug,
  moveName,
  trigger,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  // open state managed here; submission handled inside EventUpsertDialog

  const defaultTrigger = (
    <Button size="lg">
      <Plus className="w-5 h-5 mr-2" />
      Add Event
    </Button>
  );

  return (
    <EventUpsertDialog
      mode="create"
      open={open}
      onOpenChange={setOpen}
      trigger={trigger || defaultTrigger}
      categoryId={categoryId}
      categorySlug={categorySlug}
    />
  );
}
