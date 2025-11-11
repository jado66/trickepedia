"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, Edit, Trash2, GripVertical, Eye } from "lucide-react";
// Replaced @hello-pangea/dnd with @dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Document {
  id: string;
  type: string;
  title: string;
  content: string;
  isRequired: boolean;
  orderIndex: number;
}

interface DocumentManagerProps {
  documents: Document[];
  onChange: (documents: Document[]) => void;
}

const documentTypes = [
  { value: "terms_conditions", label: "Terms and Conditions" },
  { value: "media_consent", label: "Media Release Consent" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "facility_rules", label: "Facility Rules" },
  { value: "other", label: "Other" },
];

export function DocumentManager({ documents, onChange }: DocumentManagerProps) {
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const handleAddDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      type: "terms_conditions",
      title: "New Document",
      content: "Enter document content here...",
      isRequired: false,
      orderIndex: documents.length,
    };
    setEditingDocument(newDocument);
    setShowAddForm(true);
  };

  const handleSaveDocument = (document: Document) => {
    if (documents.find((d) => d.id === document.id)) {
      // Update existing
      onChange(documents.map((d) => (d.id === document.id ? document : d)));
    } else {
      // Add new
      onChange([...documents, document]);
    }
    setEditingDocument(null);
    setShowAddForm(false);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      onChange(documents.filter((d) => d.id !== id));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    const ids = documents.map((d) => d.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(documents, oldIndex, newIndex).map(
      (item, index) => ({ ...item, orderIndex: index })
    );
    onChange(reordered);
  };

  function SortableDocument({
    id,
    children,
  }: {
    id: string;
    children: (listeners: any) => React.ReactNode;
  }) {
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
      zIndex: isDragging ? 40 : undefined,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`flex items-center gap-3 p-4 bg-background border border-border rounded-lg ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        {children(listeners)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Template Documents
          </h3>
          <p className="text-sm text-muted-foreground">
            Add legal documents, terms, and other content that participants need
            to review
          </p>
        </div>
        <Button
          onClick={handleAddDocument}
          disabled={showAddForm || !!editingDocument}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={documents.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {documents.map((document) => (
                    <SortableDocument key={document.id} id={document.id}>
                      {(listeners: any) => (
                        <>
                          <div
                            {...listeners}
                            className="text-muted-foreground hover:text-foreground cursor-grab"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {document.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {documentTypes.find(
                                  (t) => t.value === document.type
                                )?.label || document.type}
                              </Badge>
                              <Badge
                                variant={
                                  document.isRequired ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {document.isRequired ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {document.content.substring(0, 100)}
                              {document.content.length > 100 && "..."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewDocument(document)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDocument(document)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDocument(document.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </SortableDocument>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {documents.length === 0 && !showAddForm && (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              No documents added
            </h3>
            <p className="text-muted-foreground mb-4">
              Add legal documents, terms and conditions, or other content for
              participants to review
            </p>
            <Button onClick={handleAddDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Document Editor */}
      {(editingDocument || showAddForm) && (
        <DocumentEditor
          document={editingDocument}
          onSave={handleSaveDocument}
          onCancel={() => {
            setEditingDocument(null);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Document Preview */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}

interface DocumentEditorProps {
  document: Document | null;
  onSave: (document: Document) => void;
  onCancel: () => void;
}

function DocumentEditor({ document, onSave, onCancel }: DocumentEditorProps) {
  const [formData, setFormData] = useState<Document>(
    document || {
      id: Date.now().toString(),
      type: "terms_conditions",
      title: "",
      content: "",
      isRequired: false,
      orderIndex: 0,
    }
  );

  const handleSave = () => {
    if (formData.title.trim() && formData.content.trim()) {
      onSave(formData);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">
          {document ? "Edit Document" : "Add New Document"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter document title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Document Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Enter the full document content..."
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={formData.isRequired}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isRequired: checked as boolean })
            }
          />
          <Label htmlFor="required" className="text-sm">
            Require participants to review this document
          </Label>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim() || !formData.content.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            Save Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {document.title}
            <Badge
              variant={document.isRequired ? "default" : "secondary"}
              className="text-xs"
            >
              {document.isRequired ? "Required" : "Optional"}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {documentTypes.find((t) => t.value === document.type)?.label ||
              document.type}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Preview
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {document.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
