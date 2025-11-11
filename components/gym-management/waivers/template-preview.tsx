"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText } from "lucide-react";

interface TemplatePreviewProps {
  templateId: string | null;
  onBack: () => void;
}

// Mock template data for preview
const mockTemplateData = {
  name: "Standard Trampoline Waiver",
  description: "Basic liability waiver for trampoline activities",
  expirationMonths: 12,
  fields: [
    {
      id: "1",
      type: "text",
      label: "First Name",
      required: true,
      placeholder: "Enter your first name",
    },
    {
      id: "2",
      type: "text",
      label: "Last Name",
      required: true,
      placeholder: "Enter your last name",
    },
    {
      id: "3",
      type: "email",
      label: "Email Address",
      required: true,
      placeholder: "your.email@example.com",
    },
    {
      id: "4",
      type: "phone",
      label: "Phone Number",
      required: true,
      placeholder: "(555) 123-4567",
    },
    { id: "5", type: "date", label: "Date of Birth", required: true },
    {
      id: "6",
      type: "text",
      label: "Emergency Contact Name",
      required: true,
      placeholder: "Full name of emergency contact",
    },
    {
      id: "7",
      type: "phone",
      label: "Emergency Contact Phone",
      required: true,
      placeholder: "(555) 123-4567",
    },
    {
      id: "8",
      type: "textarea",
      label: "Medical Conditions",
      required: false,
      placeholder:
        "List any medical conditions, allergies, or medications we should be aware of",
    },
    {
      id: "9",
      type: "checkbox",
      label: "I understand the risks involved in action sports activities",
      required: true,
    },
    {
      id: "10",
      type: "checkbox",
      label: "I agree to follow all facility rules and staff instructions",
      required: true,
    },
    {
      id: "11",
      type: "checkbox",
      label:
        "I release the facility from liability for injuries that may occur",
      required: true,
    },
    {
      id: "12",
      type: "signature",
      label: "Participant Signature",
      required: true,
    },
  ],
};

export function TemplatePreview({ templateId, onBack }: TemplatePreviewProps) {
  const template = mockTemplateData;

  const renderField = (field: any) => {
    const baseProps = {
      id: field.id,
      placeholder: field.placeholder || "",
      disabled: true, // Preview mode - fields are disabled
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "date":
        return (
          <Input
            {...baseProps}
            type={field.type === "date" ? "date" : "text"}
          />
        );

      case "textarea":
        return <Textarea {...baseProps} rows={3} />;

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.id} disabled />
            <Label htmlFor={field.id} className="text-sm leading-relaxed">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          </div>
        );

      case "signature":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Signature area</p>
          </div>
        );

      default:
        return <Input {...baseProps} />;
    }
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
            Template Preview
          </h1>
          <p className="text-muted-foreground">
            Preview how your waiver will appear to participants
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border">
          <CardHeader className="text-center border-b border-border">
            <CardTitle className="text-2xl text-card-foreground">
              {template.name}
            </CardTitle>
            <p className="text-muted-foreground">{template.description}</p>
            <div className="text-sm text-muted-foreground mt-2">
              Expires:{" "}
              {template.expirationMonths
                ? `${template.expirationMonths} months after signing`
                : "Never"}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                {field.type !== "checkbox" && (
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium text-card-foreground"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                )}
                {renderField(field)}
              </div>
            ))}

            {/* Preview Submit Button */}
            <div className="pt-6 border-t border-border">
              <Button disabled className="w-full bg-accent">
                Submit Waiver (Preview Mode)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Notice */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              This is a preview of your waiver template. All fields are disabled
              in preview mode. Participants will be able to fill out and submit
              this form when the template is active.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
