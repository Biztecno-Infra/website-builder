import React, { useState, useEffect } from "react";
import { PaddingInput, VerticalAlignment } from "@components/StyleComponents";
import { BlockFormProps } from "../types";
import { IGridCellProps } from "../../../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { defaultGridPadding } from "@utils/constant";
import { FlexRow } from "../style";
import { ReactColorPicker } from "@components/lib";

export const GridCellForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const { padding: initialPadding, backgroundColor, verticalAlign } = selectedBlock as IGridCellProps;

  const [formData, setFormData] = useState({
    padding: initialPadding || defaultGridPadding,
    backgroundColor,
    verticalAlign
  });

  useEffect(() => {
    setFormData(({
      padding: initialPadding || defaultGridPadding,
      backgroundColor,
      verticalAlign
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
      <VerticalAlignment
        value={formData.verticalAlign}
        onChange={handleChange}
        containerStyle={{ width: "60%" }}
      />
    </BasePropertyWrapper>
  );
};

