"use client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface HealthHistoryFieldProps {
  field: {
    id: string;
    label: string;
    required?: boolean;
    validation_rules?: {
      options?: string[];
    };
  };
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function HealthHistoryField({
  field,
  value = [],
  onChange,
  error,
  disabled,
}: HealthHistoryFieldProps) {
  const options = field.validation_rules?.options || [];

  const handleOptionChange = (option: string, checked: boolean) => {
    if (disabled) return;

    let newValue = [...value];

    // Handle "None of the above" logic
    if (option === "None of the above") {
      if (checked) {
        newValue = ["None of the above"];
      } else {
        newValue = [];
      }
    } else {
      // Remove "None of the above" if selecting other options
      newValue = newValue.filter((v) => v !== "None of the above");

      if (checked) {
        newValue.push(option);
      } else {
        newValue = newValue.filter((v) => v !== option);
      }
    }

    onChange?.(newValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-card-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Checkbox
                id={`${field.id}-${index}`}
                checked={value.includes(option)}
                onCheckedChange={(checked) =>
                  handleOptionChange(option, checked as boolean)
                }
                disabled={disabled}
                className={error ? "border-destructive" : ""}
              />
              <Label
                htmlFor={`${field.id}-${index}`}
                className="text-sm leading-relaxed text-card-foreground cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
