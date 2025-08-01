// hooks/useBlockForm.ts

import { useEffect, useState } from "react";

export function useBlockForm<T extends object>(
  selectedBlock: T,
  updateBlock: (blockId: string, property: string, value: any) => void
) {
  const [formData, setFormData] = useState<T>(selectedBlock);
  const blockId = (selectedBlock as any).id;

  useEffect(() => {
    setFormData(selectedBlock);
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [property]: value };
      updateBlock(blockId, property, value);
      return updated;
    });
  };

  return { formData, handleChange };
}
