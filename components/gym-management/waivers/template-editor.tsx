"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  Save,
  FolderPlus,
  Users,
} from "lucide-react";
// Replaced @hello-pangea/dnd with @dnd-kit implementation
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
import { DocumentManager } from "./document-manager";

const availableFields = [
  // Basic Fields
  {
    id: "1",
    type: "text",
    label: "First Name",
    required: true,
    category: "basic",
  },
  {
    id: "2",
    type: "text",
    label: "Last Name",
    required: true,
    category: "basic",
  },
  {
    id: "3",
    type: "email",
    label: "Email Address",
    required: true,
    category: "basic",
  },
  {
    id: "4",
    type: "phone",
    label: "Phone Number",
    required: true,
    category: "basic",
  },
  {
    id: "5",
    type: "date",
    label: "Date of Birth",
    required: true,
    category: "basic",
  },
  {
    id: "6",
    type: "textarea",
    label: "Address",
    required: false,
    category: "basic",
  },

  // Emergency Contact
  {
    id: "7",
    type: "text",
    label: "Emergency Contact Name",
    required: true,
    category: "emergency",
  },
  {
    id: "8",
    type: "phone",
    label: "Emergency Contact Phone",
    required: true,
    category: "emergency",
  },
  {
    id: "9",
    type: "text",
    label: "Emergency Contact Relationship",
    required: false,
    category: "emergency",
  },

  // Medical Information
  {
    id: "10",
    type: "health_history",
    label: "Medical Conditions",
    required: false,
    category: "medical",
  },
  {
    id: "11",
    type: "textarea",
    label: "Additional Medical Information",
    required: false,
    category: "medical",
  },
  {
    id: "12",
    type: "checkbox",
    label: "I have no known medical conditions",
    required: false,
    category: "medical",
  },

  // New Field Types
  {
    id: "13",
    type: "text_section",
    label: "Facility Rules Header",
    required: false,
    category: "content",
  },
  {
    id: "14",
    type: "embedded_video",
    label: "Safety Video",
    required: false,
    category: "content",
  },
  {
    id: "15",
    type: "embedded_image",
    label: "Facility Map",
    required: false,
    category: "content",
  },
  {
    id: "16",
    type: "multi_select",
    label: "Activities Interested In",
    required: false,
    category: "preferences",
  },
  {
    id: "17",
    type: "radio_group",
    label: "Experience Level",
    required: false,
    category: "preferences",
  },
  {
    id: "18",
    type: "file_upload",
    label: "Medical Clearance Document",
    required: false,
    category: "medical",
  },

  // Legal/Agreement
  {
    id: "19",
    type: "checkbox",
    label: "I understand the risks involved",
    required: true,
    category: "legal",
  },
  {
    id: "20",
    type: "checkbox",
    label: "I agree to follow facility rules",
    required: true,
    category: "legal",
  },
  {
    id: "21",
    type: "checkbox",
    label: "I release the facility from liability",
    required: true,
    category: "legal",
  },
  {
    id: "22",
    type: "signature",
    label: "Participant Signature",
    required: true,
    category: "legal",
  },
  {
    id: "23",
    type: "date",
    label: "Date Signed",
    required: true,
    category: "legal",
  },
];

interface FieldGroup {
  id: string;
  name: string;
  description: string;
  fields: any[];
}

interface TemplateEditorProps {
  templateId: string | null;
  onBack: () => void;
  onSave: () => void;
}

export function TemplateEditor({
  templateId,
  onBack,
  onSave,
}: TemplateEditorProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [expirationMonths, setExpirationMonths] = useState<string>("12");
  const [allowMinors, setAllowMinors] = useState(false);
  const [maxMinors, setMaxMinors] = useState(5);
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [availableFieldsList] = useState(availableFields);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (templateId) {
      // Load existing template data
      setTemplateName("Standard Trampoline Waiver");
      setTemplateDescription(
        "Basic liability waiver for trampoline activities"
      );
      setExpirationMonths("12");
      setAllowMinors(true);
      setMaxMinors(3);
      setFieldGroups([
        {
          id: "group-1",
          name: "Personal Information",
          description: "Basic participant details",
          fields: availableFields.slice(0, 5),
        },
        {
          id: "group-2",
          name: "Emergency Contact",
          description: "Emergency contact information",
          fields: availableFields.slice(7, 9),
        },
      ]);
      setDocuments([
        {
          id: "doc-1",
          type: "terms_conditions",
          title: "Terms and Conditions",
          content:
            "By signing this waiver, you agree to the following terms and conditions...",
          isRequired: true,
          orderIndex: 0,
        },
      ]);
    }
  }, [templateId]);

  const handleAddGroup = () => {
    const newGroup: FieldGroup = {
      id: `group-${Date.now()}`,
      name: "New Section",
      description: "Add fields to this section",
      fields: [],
    };
    setFieldGroups([...fieldGroups, newGroup]);
  };

  const handleUpdateGroup = (groupId: string, updates: Partial<FieldGroup>) => {
    setFieldGroups(
      fieldGroups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    setFieldGroups(fieldGroups.filter((group) => group.id !== groupId));
  };

  const handleAddFieldToGroup = (groupId: string, fieldId: string) => {
    const field = availableFieldsList.find((f) => f.id === fieldId);
    if (field) {
      setFieldGroups(
        fieldGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                fields: [
                  ...group.fields,
                  { ...field, orderIndex: group.fields.length },
                ],
              }
            : group
        )
      );
    }
  };

  const handleRemoveFieldFromGroup = (groupId: string, fieldIndex: number) => {
    setFieldGroups(
      fieldGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              fields: group.fields.filter((_, i) => i !== fieldIndex),
            }
          : group
      )
    );
  };

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const groupIds = fieldGroups.map((g) => g.id);
    const isGroupDrag = groupIds.includes(String(active.id));

    if (isGroupDrag) {
      // Reorder groups
      const oldIndex = groupIds.indexOf(String(active.id));
      const newIndex = groupIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        setFieldGroups((prev) => arrayMove(prev, oldIndex, newIndex));
      }
      return;
    }

    // Field drag inside group: ids formatted as `${groupId}::${fieldId}`
    const [activeGroupId] = String(active.id).split("::");
    const [overGroupId] = String(over.id).split("::");

    // Only reorder if same group (matches original behavior)
    if (activeGroupId === overGroupId) {
      setFieldGroups((prev) =>
        prev.map((group) => {
          if (group.id !== activeGroupId) return group;
          const ids = group.fields.map((f) => `${group.id}::${f.id}`);
          const oldIndex = ids.indexOf(String(active.id));
          const newIndex = ids.indexOf(String(over.id));
          if (oldIndex === -1 || newIndex === -1) return group;
          return {
            ...group,
            fields: arrayMove(group.fields, oldIndex, newIndex),
          };
        })
      );
    }
  };

  // Sortable wrappers
  interface SortableGroupProps {
    id: string;
    children: (listeners: any) => React.ReactNode;
  }
  function SortableGroup({ id, children }: SortableGroupProps) {
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
      zIndex: isDragging ? 50 : undefined,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`border border-border rounded-lg ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        {children(listeners)}
      </div>
    );
  }

  interface SortableFieldProps {
    id: string;
    children: (listeners: any) => React.ReactNode;
  }
  function SortableField({ id, children }: SortableFieldProps) {
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
        className={`flex items-center gap-3 p-3 bg-background border border-border rounded-lg ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        {children(listeners)}
      </div>
    );
  }

  const handleSave = () => {
    // In real app, save to Supabase
    console.log("Saving template:", {
      name: templateName,
      description: templateDescription,
      expirationMonths:
        expirationMonths === "never" ? null : Number.parseInt(expirationMonths),
      allowMinors,
      maxMinors,
      fieldGroups,
      documents, // Include documents in save data
    });
    onSave();
  };

  const getUnusedFields = () => {
    const usedFieldIds = fieldGroups.flatMap((group) =>
      group.fields.map((f) => f.id)
    );
    return availableFieldsList.filter(
      (field) => !usedFieldIds.includes(field.id)
    );
  };

  const getFieldsByCategory = (category: string) => {
    return getUnusedFields().filter((field) => field.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {templateId ? "Edit Template" : "Create New Template"}
          </h1>
          <p className="text-muted-foreground">
            Configure your waiver template fields and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Settings */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe this waiver template"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration</Label>
                <Select
                  value={expirationMonths}
                  onValueChange={setExpirationMonths}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">1 Year</SelectItem>
                    <SelectItem value="24">2 Years</SelectItem>
                    <SelectItem value="never">Never Expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-minors"
                    checked={allowMinors}
                    onCheckedChange={(checked) =>
                      setAllowMinors(checked === true)
                    }
                  />
                  <Label
                    htmlFor="allow-minors"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Allow Minor Children
                  </Label>
                </div>

                {allowMinors && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="max-minors">
                      Maximum Minors per Waiver
                    </Label>
                    <Select
                      value={maxMinors.toString()}
                      onValueChange={(v) => setMaxMinors(Number.parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Child</SelectItem>
                        <SelectItem value="2">2 Children</SelectItem>
                        <SelectItem value="3">3 Children</SelectItem>
                        <SelectItem value="5">5 Children</SelectItem>
                        <SelectItem value="10">10 Children</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="pt-4">
                <h4 className="font-medium text-card-foreground mb-3">
                  Field Library
                </h4>
                <div className="space-y-4">
                  {[
                    "basic",
                    "emergency",
                    "medical",
                    "content",
                    "preferences",
                    "legal",
                  ].map((category) => {
                    const categoryFields = getFieldsByCategory(category);
                    if (categoryFields.length === 0) return null;

                    return (
                      <div key={category}>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                          {category.replace("_", " ")} Fields
                        </h5>
                        <div className="space-y-1">
                          {categoryFields.map((field) => (
                            <div
                              key={field.id}
                              className="text-xs text-muted-foreground"
                            >
                              {field.label} ({field.type})
                              {field.required && (
                                <span className="text-destructive"> *</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">
                Template Structure
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{fieldGroups.length} Sections</Badge>
                <Button size="sm" onClick={handleAddGroup}>
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fieldGroups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No sections created
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create sections to organize your waiver fields
                  </p>
                  <Button onClick={handleAddGroup}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create First Section
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fieldGroups.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {fieldGroups.map((group) => (
                        <SortableGroup key={group.id} id={group.id}>
                          {(groupHandleListeners: any) => (
                            <>
                              {/* Group Header */}
                              <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border rounded-t-lg">
                                <div
                                  {...groupHandleListeners}
                                  className="text-muted-foreground hover:text-foreground cursor-grab"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Input
                                    value={group.name}
                                    onChange={(e) =>
                                      handleUpdateGroup(group.id, {
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder="Section name"
                                    className="font-medium"
                                  />
                                  <Input
                                    value={group.description}
                                    onChange={(e) =>
                                      handleUpdateGroup(group.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Section description"
                                    className="text-sm"
                                  />
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {group.fields.length} fields
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveGroup(group.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {/* Group Fields */}
                              <div className="p-4">
                                <SortableContext
                                  items={group.fields.map(
                                    (f) => `${group.id}::${f.id}`
                                  )}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-2">
                                    {group.fields.map((field) => (
                                      <SortableField
                                        key={`${group.id}::${field.id}`}
                                        id={`${group.id}::${field.id}`}
                                      >
                                        {(fieldHandleListeners: any) => (
                                          <>
                                            <div
                                              {...fieldHandleListeners}
                                              className="text-muted-foreground hover:text-foreground cursor-grab"
                                            >
                                              <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground text-sm">
                                                  {field.label}
                                                </span>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {field.type}
                                                </Badge>
                                                {field.required && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                  >
                                                    Required
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveFieldFromGroup(
                                                  group.id,
                                                  group.fields.indexOf(field)
                                                )
                                              }
                                              className="text-destructive hover:text-destructive"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </>
                                        )}
                                      </SortableField>
                                    ))}
                                    {/* Add Field to Group */}
                                    <div className="pt-2">
                                      <Select
                                        onValueChange={(fieldId) =>
                                          handleAddFieldToGroup(
                                            group.id,
                                            fieldId
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Add field to this section..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getUnusedFields().map((field) => (
                                            <SelectItem
                                              key={field.id}
                                              value={field.id}
                                            >
                                              {field.label} ({field.type})
                                              {field.required && (
                                                <span className="text-destructive">
                                                  {" "}
                                                  *
                                                </span>
                                              )}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </SortableContext>
                              </div>
                            </>
                          )}
                        </SortableGroup>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Management Section */}
      <DocumentManager documents={documents} onChange={setDocuments} />

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
          <Save className="w-4 h-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
}
