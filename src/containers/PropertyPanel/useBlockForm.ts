// hooks/useBlockForm.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "../../utils/debounce";

export const useBlockForm = (selectedBlock: any, updateBlock: any) => {
  const [formData, setFormData] = useState<any>(selectedBlock || {});
  const pendingUpdates = useRef<Record<string, any>>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form data only when selectedBlock changes
  useEffect(() => {
    if (selectedBlock) {
      setFormData({ ...selectedBlock });
      // Clear any pending updates when block changes
      pendingUpdates.current = {};
    }
  }, [selectedBlock?.id]); // Only depend on ID to avoid unnecessary updates

  // Debounced update function
  const debouncedUpdateBlock = useCallback(
    debounce((blockId: string, updates: Record<string, any>) => {
      Object.entries(updates).forEach(([property, value]) => {
        updateBlock(blockId, property, value);
      });
      pendingUpdates.current = {};
    }, 150), // 150ms debounce
    [updateBlock]
  );

  // Single optimized handler for all property changes
  const handleChange = useCallback((property: string, value: any) => {
    setFormData((prevData: any) => ({ ...prevData, [property]: value }));
    pendingUpdates.current[property] = value;
    debouncedUpdateBlock(selectedBlock.id, { ...pendingUpdates.current });
  }, [selectedBlock?.id, debouncedUpdateBlock]);

  // Batch update handler for multiple properties
  const handleBatchChange = useCallback((updates: Record<string, any>) => {
    setFormData((prevData: any) => ({ ...prevData, ...updates }));
    Object.assign(pendingUpdates.current, updates);
    debouncedUpdateBlock(selectedBlock.id, { ...pendingUpdates.current });
  }, [selectedBlock?.id, debouncedUpdateBlock]);

  // Immediate update for critical properties (like fontSize that affects lineHeight)
  const handleImmediateChange = useCallback((property: string, value: any) => {
    setFormData((prevData: any) => ({ ...prevData, [property]: value }));
    updateBlock(selectedBlock.id, property, value);
  }, [selectedBlock?.id, updateBlock]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    handleChange,
    handleBatchChange,
    handleImmediateChange,
    setFormData
  };
};