import React, { useState, useEffect } from "react";
import { PaddingInput, VerticalAlignmentDropdown } from "@components/StyleComponents";
import { BlockFormProps } from "../types";
import { IGridCellProps } from "../../../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { defaultGridPadding } from "@utils/constant";
import { ReactColorPicker } from "@components/CustomInputs";
import { FlexRow } from "../style";

export const GridCellForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const { padding: initialPadding, backgroundColor, verticalAlignment } = selectedBlock as IGridCellProps;

  const [formData, setFormData] = useState({
    padding: initialPadding || defaultGridPadding,
    backgroundColor,
    verticalAlignment
  });

  useEffect(() => {
    setFormData(({
      padding: initialPadding || defaultGridPadding,
      backgroundColor,
      verticalAlignment
    }));
  }, [selectedBlock]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    updateBlock(selectedBlock.id, field, value);
  };

  return (
    <BasePropertyWrapper name="Edit Column" containerStyle={{ border: 'none' }}>
      <FlexRow>
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("backgroundColor", value)}
          label={"Select Background color"}
          selectedColor={formData.backgroundColor}
          containerStyle={{ width: "60%" }}
        />
        <PaddingInput
          padding={formData.padding}
          onChange={(padding) => handleChange("padding", padding)}
          containerStylePopUp={{ width: "35%" }}
        />
      </FlexRow>
      <VerticalAlignmentDropdown
        value={formData.verticalAlignment}
        onChange={handleChange}
      />
    </BasePropertyWrapper>
  );
};

