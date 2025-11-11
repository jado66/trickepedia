"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditEventDialog } from "@/components/events/edit-event-dialog";
import { DeleteEventDialog } from "@/components/events/delete-event-dialog";
import { Edit, Trash2 } from "lucide-react";
import type { Event } from "@/types/event";

interface EventActionsProps {
  event: Event;
  showInCard?: boolean;
}

export function EventActions({ event, showInCard = false }: EventActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (showInCard) {
    return (
      <>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <EditEventDialog
          event={event}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
        <DeleteEventDialog
          event={event}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Event
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <EditEventDialog
        event={event}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteEventDialog
        event={event}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete
      />
    </>
  );
}
