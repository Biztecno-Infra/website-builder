// hooks/useBlockForm.ts
import { useEffect, useState } from "react";

export function useBlockForm<T extends object>(
  selectedBlock: T,
  updateBlock: (id: string, key: keyof T, value: any) => void
) {
  const { id: blockId, ...rest } = selectedBlock as any;
  const [formData, setFormData] = useState<any>(rest);

  useEffect(() => {
    setFormData(rest);
  }, [selectedBlock]);

  const handleChange = (property: keyof T, value: any) => {
    setFormData((prev: any) => ({ ...prev, [property]: value }));
    updateBlock(blockId, property, value);
  };

  return { formData, handleChange };
}
