import React from "react";
import { PaddingInput, VerticalAlignment } from "@components/StyleComponents";
import { BlockFormProps } from "../types";
import { IGridCellProps } from "../../../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { defaultGridPadding } from "@utils/constant";
import { FlexRow } from "../style";
import { CustomInput, ReactColorPicker } from "@components/lib";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { extractBackgroundUrl } from "@utils/common";
import { useBlockForm } from "../useBlockForm";

export const GridCellForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {

  // Use the optimized form hook
  const { formData, handleChange } = useBlockForm(selectedBlock as IGridCellProps, updateBlock);

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

      <BasePropertyWrapper
        name="Background Properties"
        subLabel
        containerStyle={{
          padding: 0,
          width: "95%",
          border: "none",
          marginTop: "0.5rem",
        }}
      >
        <BackgroundProperties
          onChange={handleChange}
          backgroundImage={extractBackgroundUrl(formData.backgroundImage || "")}
          backgroundPosition={formData.backgroundPosition || ""}
          backgroundRepeat={formData.backgroundRepeat || ""}
          backgroundSize={formData.backgroundSize || ""}
          containerStyle={{
            border: "1px solid #DDDDDD",
            borderRadius: "10px",
            padding: "0.5rem",
          }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper
        name="Border Properties"
        subLabel
        containerStyle={{
          padding: 0,
          width: "95%",
          border: "none",
          marginTop: "0.5rem",
        }}
      >
        <BorderStyleDropdown
          onChange={handleChange}
          borderWidth={formData.borderWidth}
          borderStyle={formData.borderStyle}
          borderColor={formData.borderColor}
          borderRadius={formData.borderRadius}
          containerStyle={{
            border: "1px solid #DDDDDD",
            borderRadius: "10px",
            padding: "0.5rem",
          }}
        />
      </BasePropertyWrapper>
    </BasePropertyWrapper>
  );
};
