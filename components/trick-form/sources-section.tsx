import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";
import { ArrayField } from "../array-fields";
import type { TrickFormSectionProps } from "@/types/trick-form";

export function SourcesSection({
  formData,
  mode,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}: {
  formData: TrickFormSectionProps["formData"];
  mode: TrickFormSectionProps["mode"];
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddItem: (field: string) => void;
  onRemoveItem: (field: string, index: number) => void;
}) {
  return (
    <AccordionItem value="sources" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Sources & References</h3>
            <p className="text-sm text-muted-foreground">
              Original sources, tutorials, and references
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <ArrayField
            title="Source URLs"
            field="source_urls"
            placeholder="https://example.com/tutorial"
            icon={<ExternalLink className="h-4 w-4" />}
            type="url"
            items={formData.source_urls || []}
            mode={mode}
            onArrayChange={onArrayChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
