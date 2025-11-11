"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, CheckCircle } from "lucide-react";

interface FileUploadFieldProps {
  field: {
    id: string;
    label: string;
    required?: boolean;
    validation_rules?: {
      accepted_types?: string[];
      max_size?: string;
      description?: string;
    };
  };
  value?: File | null;
  onChange?: (value: File | null) => void;
  error?: string;
  disabled?: boolean;
}

export function FileUploadField({
  field,
  value,
  onChange,
  error,
  disabled,
}: FileUploadFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rules = field.validation_rules || {};
  const acceptedTypes = rules.accepted_types?.join(",") || "*";
  const maxSize = rules.max_size || "5MB";

  const handleFileSelect = (file: File) => {
    if (disabled) return;
    onChange?.(file);
  };

  const handleFileRemove = () => {
    if (disabled) return;
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-card-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {rules.description && (
        <p className="text-sm text-muted-foreground">{rules.description}</p>
      )}

      <Card
        className={`bg-card border-border ${error ? "border-destructive" : ""}`}
      >
        <CardContent className="p-4">
          {value ? (
            // File selected
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {value.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(value.size)}
                  </p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFileRemove}
                disabled={disabled}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            // Upload area
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-card-foreground mb-1">
                Drop your file here or{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-accent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  browse
                </Button>
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  Max: {maxSize}
                </Badge>
                {rules.accepted_types && (
                  <Badge variant="outline" className="text-xs">
                    {rules.accepted_types.join(", ")}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
