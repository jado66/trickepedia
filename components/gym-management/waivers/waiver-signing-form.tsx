"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SignatureCanvas } from "./signature-canvas";
import { MinorChildrenManager } from "./minor-children-manager";
import {
  TextSectionField,
  HealthHistoryField,
  EmbeddedMediaField,
  MultiSelectField,
  RadioGroupField,
  FileUploadField,
} from "./field-components";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Eye,
  Maximize2,
} from "lucide-react";
import { DocumentViewerModal } from "./document-viewer-modal";
import { useWaivers } from "@/contexts/waivers/waiver-provider";

interface WaiverSigningFormProps {
  templateId: string;
}

// Fallback minimal template if not found (should rarely be used)
const fallbackTemplate = {
  id: "1",
  name: "Standard Trampoline Waiver",
  description: "Basic liability waiver for trampoline activities",
  businessName: "Sky High Trampoline Park",
  expirationMonths: 12,
  allowMinors: true,
  maxMinors: 3,
  fieldGroups: [
    {
      id: "group-1",
      name: "Personal Information",
      description: "Basic participant details",
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
      ],
    },
    {
      id: "group-2",
      name: "Emergency Contact",
      description: "Emergency contact information",
      fields: [
        {
          id: "6",
          type: "text",
          label: "Emergency Contact Name",
          required: true,
          placeholder: "Full name",
        },
        {
          id: "7",
          type: "phone",
          label: "Emergency Contact Phone",
          required: true,
          placeholder: "(555) 123-4567",
        },
      ],
    },
    {
      id: "group-3",
      name: "Medical Information",
      description: "Health and medical details",
      fields: [
        {
          id: "8",
          type: "text_section",
          label: "Medical Information Notice",
          validation_rules: {
            content:
              "Please provide accurate medical information to ensure your safety during activities.",
          },
        },
        {
          id: "9",
          type: "health_history",
          label: "Medical Conditions",
          required: false,
          validation_rules: {
            options: [
              "Heart condition or heart disease",
              "High or low blood pressure",
              "Diabetes",
              "Asthma or breathing problems",
              "Back, neck, or spine problems",
              "Joint problems (knees, ankles, shoulders)",
              "Pregnancy",
              "Taking prescription medications",
              "None of the above",
            ],
          },
        },
        {
          id: "10",
          type: "embedded_video",
          label: "Safety Video",
          required: true,
          validation_rules: {
            video_url: "/safety-video.mp4",
            duration: "3:45",
            description:
              "Please watch this important safety video before proceeding",
          },
        },
      ],
    },
    {
      id: "group-4",
      name: "Activity Preferences",
      description: "Your activity interests and experience",
      fields: [
        {
          id: "11",
          type: "multi_select",
          label: "Activities Interested In",
          required: true,
          validation_rules: {
            options: [
              "Trampoline jumping",
              "Foam pit",
              "Dodgeball",
              "Basketball dunking",
              "Fitness classes",
            ],
            min_selections: 1,
          },
        },
        {
          id: "12",
          type: "radio_group",
          label: "Experience Level",
          required: true,
          validation_rules: {
            options: [
              "Beginner - First time",
              "Intermediate - Some experience",
              "Advanced - Very experienced",
            ],
          },
        },
      ],
    },
    {
      id: "group-5",
      name: "Legal Agreement",
      description: "Liability agreements and signatures",
      fields: [
        {
          id: "13",
          type: "checkbox",
          label: "I understand the risks involved in action sports activities",
          required: true,
        },
        {
          id: "14",
          type: "checkbox",
          label: "I agree to follow all facility rules and staff instructions",
          required: true,
        },
        {
          id: "15",
          type: "checkbox",
          label: "I release the facility from liability for injuries",
          required: true,
        },
        {
          id: "16",
          type: "signature",
          label: "Participant Signature",
          required: true,
        },
      ],
    },
  ],
  documents: [
    {
      id: "doc-1",
      type: "terms_conditions",
      title: "Terms and Conditions",
      content: "By signing this waiver, you agree to the following terms...",
      isRequired: true,
    },
    {
      id: "doc-2",
      type: "media_consent",
      title: "Media Release Consent",
      content: "I consent to the use of photographs and videos...",
      isRequired: false,
    },
  ],
};

export function WaiverSigningForm({ templateId }: WaiverSigningFormProps) {
  const { getTemplate, signWaiver } = useWaivers();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [minorChildren, setMinorChildren] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [viewedDocuments, setViewedDocuments] = useState<Set<string>>(
    new Set()
  );
  const signatureRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    const el = containerRef.current || document.documentElement;
    if (!document.fullscreenElement && (el as any).requestFullscreen) {
      (el as any).requestFullscreen().catch(() => {
        /* ignore */
      });
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
    setIsComplete(false);
    setMinorChildren([]);
    setSelectedDocument(null);
    setViewedDocuments(new Set());
    signatureRef.current?.clear();

    // scroll to top
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const template = getTemplate(templateId) || (fallbackTemplate as any);
  const totalSteps = template.fieldGroups.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const currentGroup = template.fieldGroups[currentStep];

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" });
    }
  };

  const handleDocumentView = (document: any) => {
    setSelectedDocument(document);
    setViewedDocuments(new Set([...viewedDocuments, document.id]));
  };

  const validateStep = (step: number) => {
    const group = template.fieldGroups[step];
    const stepErrors: Record<string, string> = {};

    group.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.id];

        // Special validation for different field types
        switch (field.type) {
          case "text_section":
          case "embedded_image":
            // These don't require validation
            break;
          case "embedded_video":
            if (!value) {
              stepErrors[field.id] = "Please watch the required video";
            }
            break;
          case "health_history":
          case "multi_select":
            if (!value || (Array.isArray(value) && value.length === 0)) {
              stepErrors[field.id] = `${field.label} is required`;
            }
            break;
          case "signature":
            if (signatureRef.current && signatureRef.current.isEmpty()) {
              stepErrors["signature"] = "Signature is required";
            }
            break;
          default:
            if (!value || (typeof value === "string" && value.trim() === "")) {
              stepErrors[field.id] = `${field.label} is required`;
            }
        }
      }
    });

    // Check required documents have been viewed
    const requiredDocs = template.documents.filter((doc) => doc.isRequired);
    requiredDocs.forEach((doc) => {
      if (!viewedDocuments.has(doc.id)) {
        stepErrors[`doc-${doc.id}`] = `Please review the ${doc.title}`;
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current?.toDataURL();
      // Dynamically derive participant metadata instead of relying on brittle numeric IDs ("1","2","3","4").
      // Helper to locate the first field whose predicate matches and return its captured value.
      const getValue = (predicate: (field: any) => boolean): any => {
        for (const group of template.fieldGroups) {
          for (const field of group.fields) {
            if (predicate(field)) {
              const v = formData[field.id];
              if (v != null && v !== "") return v;
            }
          }
        }
        return undefined;
      };

      // Attempt to identify name components.
      const firstName = getValue(
        (f) =>
          (f.type === "text" || f.type === "name") &&
          typeof f.label === "string" &&
          /first/.test(f.label.toLowerCase())
      );
      const lastName = getValue(
        (f) =>
          (f.type === "text" || f.type === "name") &&
          typeof f.label === "string" &&
          /last/.test(f.label.toLowerCase())
      );
      const fullNameField = getValue(
        (f) =>
          (f.type === "text" || f.type === "name") &&
          typeof f.label === "string" &&
          /name/.test(f.label.toLowerCase()) &&
          !(/first/.test(f.label.toLowerCase()) || /last/.test(f.label.toLowerCase()))
      );
      const participantName =
        [firstName, lastName].filter(Boolean).join(" ") ||
        (fullNameField as string) ||
        // Fallback to previous numeric keys if they exist (legacy templates)
        `${formData["1"] || ""} ${formData["2"] || ""}`.trim() ||
        "Participant";

      // Email & phone extraction
      const emailValue =
        getValue((f) => f.type === "email") ||
        formData["email"] ||
        formData["3"] ||
        "unknown@example.com";
      const phoneValue =
        getValue((f) => f.type === "phone") ||
        formData["phone"] ||
        formData["4"];

      // Minimal persistence: store signed waiver metadata only; omit form fields & signature per requirements
      await signWaiver({
        templateId,
        participantName,
        email: emailValue,
        phone: phoneValue,
        minorCount: minorChildren.length || undefined,
      });

      // (Optional) In the future we may persist form field answers & signatureData to a secure store.
      // console.debug("Signed waiver metadata", { participantName, emailValue, phoneValue });
      setIsComplete(true);
    } catch (error) {
      console.error("Error submitting waiver:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case "text_section":
        return <TextSectionField field={field} />;

      case "health_history":
        return (
          <HealthHistoryField
            field={field}
            value={value}
            onChange={(val) => handleInputChange(field.id, val)}
            error={error}
          />
        );

      case "embedded_video":
      case "embedded_image":
        return (
          <EmbeddedMediaField
            field={field}
            value={value}
            onChange={(val) => handleInputChange(field.id, val)}
            error={error}
          />
        );

      case "multi_select":
        return (
          <MultiSelectField
            field={field}
            value={value}
            onChange={(val) => handleInputChange(field.id, val)}
            error={error}
          />
        );

      case "radio_group":
        return (
          <RadioGroupField
            field={field}
            value={value}
            onChange={(val) => handleInputChange(field.id, val)}
            error={error}
          />
        );

      case "file_upload":
        return (
          <FileUploadField
            field={field}
            value={value}
            onChange={(val) => handleInputChange(field.id, val)}
            error={error}
          />
        );

      case "text":
      case "email":
      case "phone":
        return (
          <div className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-card-foreground"
            >
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "phone"
                  ? "tel"
                  : "text"
              }
              value={value || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-card-foreground"
            >
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-card-foreground"
            >
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={field.id}
              value={value || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={field.id}
                checked={value === true}
                onCheckedChange={(checked) =>
                  handleInputChange(field.id, checked)
                }
                className={error ? "border-destructive" : ""}
              />
              <Label
                htmlFor={field.id}
                className="text-sm leading-relaxed text-card-foreground"
              >
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>
            {error && <p className="text-sm text-destructive ml-6">{error}</p>}
          </div>
        );

      case "signature":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <SignatureCanvas ref={signatureRef} />
            {errors["signature"] && (
              <p className="text-sm text-destructive">{errors["signature"]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="container mx-auto py-12 px-4 bg-background min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                Waiver Submitted Successfully!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your waiver has been signed and submitted. You can now
                participate in activities at {template.businessName}.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Waiver Details:</strong>
                  <br />
                  Template: {template.name}
                  <br />
                  Signed: {new Date().toLocaleDateString()}
                  <br />
                  {minorChildren.length > 0 && (
                    <>
                      Minor Children: {minorChildren.length}
                      <br />
                    </>
                  )}
                  {template.expirationMonths &&
                    `Expires: ${new Date(
                      Date.now() +
                        template.expirationMonths * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}`}
                </p>
              </div>
              <Button
                onClick={resetForm}
                className="bg-accent hover:bg-accent/90"
              >
                Sign Another Waiver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="container mx-auto py-8 px-4 bg-background min-h-screen overflow-auto"
    >
      {/* Fullscreen Button (enter only) */}

      <div className="max-w-2xl mx-auto relative">
        {!isFullscreen && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              // Disable once in fullscreen; ESC exits
              onClick={enterFullscreen}
              aria-label="Enter fullscreen"
              disabled={isFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Document Viewer Modal */}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {template.name}
          </h1>
          <p className="text-muted-foreground">{template.businessName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {template.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Documents & Minor Children Step Content (only visible on first step) */}
        {currentStep === 0 && template.documents.length > 0 && (
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Important Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.documents.map((doc) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    onClick={() => handleDocumentView(doc)}
                    className="justify-between h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.isRequired ? "Required" : "Optional"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewedDocuments.has(doc.id) && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <Eye className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
              {template.documents.some(
                (doc) => doc.isRequired && !viewedDocuments.has(doc.id)
              ) && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Please review all required documents before proceeding.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 0 && template.allowMinors && (
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Minor Children
                <Badge variant="secondary" className="text-xs">
                  Optional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MinorChildrenManager
                minors={minorChildren}
                onChange={setMinorChildren}
                maxMinors={template.maxMinors}
              />
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {currentGroup.name}
            </CardTitle>
            {currentGroup.description && (
              <p className="text-sm text-muted-foreground">
                {currentGroup.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {currentGroup.fields.map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))}

            {/* Legal Notice for Final Step */}
            {currentStep === totalSteps - 1 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  By signing this waiver, you acknowledge that you have read,
                  understood, and agree to all terms and conditions. This is a
                  legally binding document.
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-accent hover:bg-accent/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Waiver"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            This waiver will expire{" "}
            {template.expirationMonths
              ? `${template.expirationMonths} months after signing`
              : "never"}
            . All information is kept confidential and secure.
          </p>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}
