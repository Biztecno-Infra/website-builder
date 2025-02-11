import React, { useEffect, useState } from "react";
import { ColorPicker, CustomInput } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { DividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";

export const DividerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    backgroundColor,
    thickness = 2,
    alignment = "center",
    padding,
    dividerColor,
    id: blockId,
  } = selectedBlock as DividerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    thickness,
    alignment,
    padding,
    dividerColor,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      thickness,
      alignment,
      padding,
      dividerColor,
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
    <BasePropertyWrapper name="Divider Block">
      <ColorPicker
        type={"dividerColor"}
        onColorChange={(field, value) => handleChange("dividerColor", value)}
        label={"Select Divider color"}
        selectedColor={formData.dividerColor || ""}
      />

      <ColorPicker
        type={"bgColor"}
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label={"Select Background color"}
        selectedColor={formData.backgroundColor}
      />

      <CustomInput
        id="thickness"
        name="thickness"
        label="Divider Thickness"
        placeholder="Enter Divider Thickness"
        value={formData.thickness}
        type="number"
        onChange={(name, value) => handleChange("thickness", value)}
      />
      <PaddingInput
        padding={formData.padding}
        onChange={(padding: any) => handleChange("padding", padding)}
      />
    </BasePropertyWrapper>
  );
};
