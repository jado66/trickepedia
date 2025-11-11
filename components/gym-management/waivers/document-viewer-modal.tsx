"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface DocumentViewerModalProps {
  document: {
    id: string;
    type: string;
    title: string;
    content: string;
    isRequired: boolean;
  };
  onClose: () => void;
}

export function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.title}
            <Badge
              variant={document.isRequired ? "default" : "secondary"}
              className="text-xs"
            >
              {document.isRequired ? "Required" : "Optional"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {document.content}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-accent hover:bg-accent/90">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
