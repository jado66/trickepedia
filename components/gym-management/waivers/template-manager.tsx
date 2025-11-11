"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Copy, Eye } from "lucide-react";
import { TemplateEditor } from "./template-editor";
import { TemplatePreview } from "./template-preview";
import { useWaivers } from "@/contexts/waivers/waiver-provider";

export function TemplateManager({
  setWaiverPage,
}: {
  setWaiverPage: (page: string) => void;
}) {
  const { templates, duplicateTemplate, deleteTemplate, toggleTemplateActive } =
    useWaivers();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "preview">("list");

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setMode("edit");
  };

  const handleEdit = (templateId: string) => {
    setSelectedTemplate(templateId);
    setMode("edit");
  };

  const handlePreview = (templateId: string) => {
    setSelectedTemplate(templateId);
    setMode("preview");
  };

  const handleDuplicate = async (templateId: string) => {
    await duplicateTemplate(templateId);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(templateId);
    }
  };

  const handleToggleActive = async (templateId: string) => {
    await toggleTemplateActive(templateId);
  };

  const handleBackToList = () => {
    setMode("list");
    setSelectedTemplate(null);
  };

  if (mode === "edit") {
    return (
      <TemplateEditor
        templateId={selectedTemplate}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  if (mode === "preview") {
    return (
      <TemplatePreview
        templateId={selectedTemplate}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {templates.length} Templates
          </Badge>
          <Badge variant="outline" className="text-sm">
            {templates.filter((t) => t.active).length} Active
          </Badge>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="bg-card border-border hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-card-foreground">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={template.active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {template.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="ml-2 font-medium text-card-foreground">
                    {template.fieldCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="ml-2 font-medium text-card-foreground">
                    {template.expirationMonths
                      ? `${template.expirationMonths}mo`
                      : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-medium text-card-foreground">
                    {template.createdAt}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Used:</span>
                  <span className="ml-2 font-medium text-card-foreground">
                    {template.lastUsed || "Never"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(template.id)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Toggle Active Status */}
              <Button
                variant={template.active ? "secondary" : "default"}
                size="sm"
                onClick={() => handleToggleActive(template.id)}
                className="w-full"
              >
                {template.active ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  No templates yet
                </h3>
                <p className="text-muted-foreground">
                  Create your first waiver template to get started
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
