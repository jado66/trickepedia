import * as React from "react";

export interface DeleteCategoryDialogProps {
  open: boolean;
  category: string | null;
  categories: string[];
  onOpenChange: (o: boolean) => void;
  onConfirm: (replacement?: string) => void;
  onRemoveAll: () => void;
}

export declare function DeleteCategoryDialog(
  props: DeleteCategoryDialogProps
): React.JSX.Element;
