import React from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { FlexContainer, FlexRow, FormWrapper } from "../style";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { useBlockForm } from "../useBlockForm";
import { useTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  const { formData, handleChange } = useBlockForm(
    selectedBlock as SpacerProps,
    updateBlock
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Spacer">
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
              color: formData.hideOnDesktop ? theme.colors.primary : "#DDDDDD",
            }}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.MobileIcon}
            onClick={() => handleChange("hideOnMobile", !formData.hideOnMobile)}
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              width: "50%",
              color: formData.hideOnMobile ? theme.colors.primary : "#DDDDDD",
            }}
          />
        </FlexContainer>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={formData.customCss || ""}
          rows={6}
          onChange={(name, value) => handleChange("customCss", value)}
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
