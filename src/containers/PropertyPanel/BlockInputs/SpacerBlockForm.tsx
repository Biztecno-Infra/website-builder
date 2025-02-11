import React, { useEffect, useState } from "react";
import { ColorPicker, CustomInput } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    id: blockId,
    backgroundColor,
    padding,
  } = selectedBlock as SpacerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    padding,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      padding,
    });
  }, [selectedBlock]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [field]: value,
      };

      updateBlock(blockId, field, value);

      return updatedFormData;
    });
  };

  return (
    <BasePropertyWrapper name="Spacer Block">
      <ColorPicker
        type={"bgColor"}
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label={"Select Background color"}
        selectedColor={formData.backgroundColor}
      />
      <PaddingInput
        padding={formData.padding}
        onChange={(padding: any) => handleChange("padding", padding)}
      />
    </BasePropertyWrapper>
  );
};
