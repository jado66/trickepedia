"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface MultiSelectFieldProps {
  field: {
    id: string;
    label: string;
    required?: boolean;
    validation_rules?: {
      options?: string[];
      min_selections?: number;
    };
  };
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function MultiSelectField({
  field,
  value = [],
  onChange,
  error,
  disabled,
}: MultiSelectFieldProps) {
  const options = field.validation_rules?.options || [];
  const minSelections = field.validation_rules?.min_selections || 0;

  const handleOptionChange = (option: string, checked: boolean) => {
    if (disabled) return;

    let newValue = [...value];

    if (checked) {
      newValue.push(option);
    } else {
      newValue = newValue.filter((v) => v !== option);
    }

    onChange?.(newValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-card-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
        {minSelections > 0 && (
          <span className="text-muted-foreground ml-2 text-xs">
            (Select at least {minSelections})
          </span>
        )}
      </Label>

      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
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

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  );
}
