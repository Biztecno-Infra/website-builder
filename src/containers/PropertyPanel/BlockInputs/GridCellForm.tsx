import React from "react";
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

  // Use the optimized form hook
  const { formData, handleChange } = useBlockForm(selectedBlock as IGridCellProps, updateBlock);

  return (
    <BasePropertyWrapper name="Edit Column" containerStyle={{ border: 'none' }}>
      <FlexRow>
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("backgroundColor", value)}
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

