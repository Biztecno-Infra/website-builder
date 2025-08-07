import React, { useState, useEffect } from "react";
import { PaddingInput, VerticalAlignment } from "@components/StyleComponents";
import { BlockFormProps } from "../types";
import { IGridCellProps } from "../../../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { defaultGridPadding } from "@utils/constant";
import { FlexRow } from "../style";
import { CustomInput, ReactColorPicker } from "@components/lib";

export const GridCellForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    padding: initialPadding,
    backgroundColor,
    verticalAlign,
    layerName,
  } = selectedBlock as IGridCellProps;

  const [formData, setFormData] = useState({
    padding: initialPadding || defaultGridPadding,
    backgroundColor,
    verticalAlign,
    layerName,
  });

  useEffect(() => {
    setFormData({
      padding: initialPadding || defaultGridPadding,
      backgroundColor,
      verticalAlign,
      layerName,
    });
  }, [selectedBlock]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    updateBlock(selectedBlock.id, field, value);
  };

  return (
    <BasePropertyWrapper name="Edit Column" containerStyle={{ border: "none" }}>
      <CustomInput
        name="layerName"
        placeholder="Enter Layer Name"
        value={formData.layerName || ""}
        onChange={(name, value) => handleChange("layerName", value)}
        containerStyle={{
          width: "100%",
          marginBottom: "10px",
        }}
      />
      <FlexRow>
        <ReactColorPicker
          onColorChange={(field, value) =>
            handleChange("backgroundColor", value)
          }
          label={"Select Background color"}
          selectedColor={formData.backgroundColor}
          containerStyle={{ width: "53%" }}
        />
        <PaddingInput
          padding={formData.padding}
          onChange={(padding) => handleChange("padding", padding)}
          containerStylePopUp={{ width: "45%" }}
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
