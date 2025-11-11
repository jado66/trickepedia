"use client";

import type { Event } from "@/types/event";
import { EventUpsertDialog } from "@/components/events/event-upsert-dialog";

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({
  event,
  open,
  onOpenChange,
}: EditEventDialogProps) {
  return (
    <EventUpsertDialog
      mode="edit"
      event={event}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
