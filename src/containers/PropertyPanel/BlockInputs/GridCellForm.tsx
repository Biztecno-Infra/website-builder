import React from "react";
import { PaddingInput, VerticalAlignment } from "@components/StyleComponents";
import { BlockFormProps } from "../types";
import { IGridCellProps } from "../../../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { FlexContainer, FlexRow } from "../style";
import { CustomInput, ReactColorPicker } from "@components/lib";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { extractBackgroundUrl } from "@utils/common";
import { useBlockForm } from "../useBlockForm";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useTheme } from "styled-components";

export const GridCellForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
  selectedBrand
}) => {
  const theme = useTheme();
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
          selectedBrand={selectedBrand}
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
            <BasePropertyWrapper name="Hide Element">
        <FlexContainer>
          <SvgIcon
            name={CUSTOM_SVG_ICON.DesktopIcon}
            onClick={() =>
              handleChange("hideOnDesktop", !formData.hideOnDesktop)
            }
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRight: " 1px solid #DDDDDD",
              width: "50%",
              color: formData.hideOnDesktop ? theme.colors.background :theme.colors.primary ,
            }}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.MobileIcon}
            onClick={() => handleChange("hideOnMobile", !formData.hideOnMobile)}
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              width: "50%",
              color: formData.hideOnMobile ? theme.colors.background :theme.colors.primary ,
            }}
          />
        </FlexContainer>
      </BasePropertyWrapper>

    </BasePropertyWrapper>
  );
};
