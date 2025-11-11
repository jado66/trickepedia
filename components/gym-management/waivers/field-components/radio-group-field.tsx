"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

interface RadioGroupFieldProps {
  field: {
    id: string;
    label: string;
    required?: boolean;
    validation_rules?: {
      options?: string[];
    };
  };
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RadioGroupField({
  field,
  value,
  onChange,
  error,
  disabled,
}: RadioGroupFieldProps) {
  const options = field.validation_rules?.options || [];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-card-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <RadioGroup
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            className="space-y-3"
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={option}
                  id={`${field.id}-${index}`}
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
          </RadioGroup>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
