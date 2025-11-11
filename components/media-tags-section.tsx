import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ImageIcon, Video, Tag } from "lucide-react";
import { MediaPreview } from "./media-preview";
import { ArrayField } from "./array-fields";

interface MediaTagsSectionProps {
  formData: {
    image_urls: string[];
    video_urls: string[];
    tags: string[];
    [key: string]: any;
  };
  mode: "view" | "edit" | "create";
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddItem: (field: string) => void;
  onRemoveItem: (field: string, index: number) => void;
}

export function MediaTagsSection({
  formData,
  mode,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}: MediaTagsSectionProps) {
  return (
    <AccordionItem value="media" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Media & Tags</h3>
            <p className="text-sm text-muted-foreground">
              Videos, images, and categorization
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Enhanced preview section for edit/create modes */}
          {(mode === "edit" || mode === "create") && (
            <MediaPreview formData={formData} mode={mode} />
          )}

          <ArrayField
            title="Video URLs"
            field="video_urls"
            placeholder="https://youtube.com/watch?v=..."
            icon={<Video className="h-4 w-4" />}
            type="url"
            items={formData.video_urls}
            mode={mode}
            onArrayChange={onArrayChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />

          <ArrayField
            title="Image URLs"
            field="image_urls"
            placeholder="https://example.com/image.jpg"
            icon={<ImageIcon className="h-4 w-4" />}
            type="url"
            items={formData.image_urls}
            mode={mode}
            onArrayChange={onArrayChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />

          <ArrayField
            title="Tags"
            field="tags"
            placeholder="e.g., beginner-friendly, outdoor, urban"
            icon={<Tag className="h-4 w-4" />}
            items={formData.tags}
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
