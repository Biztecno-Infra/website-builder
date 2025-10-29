import React from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { VDividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexContainer, FlexRow, FormWrapper } from "../style";
import { useBlockForm } from "../useBlockForm";
import styled, { useTheme } from "styled-components";

const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
  width: 100%;
`;

export const VerticalDividerForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  const { formData, handleChange } = useBlockForm(
    selectedBlock as VDividerProps,
    updateBlock
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Divider">
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
              handleChange("dividerColor", value)
            }
            label={"Select Divider color"}
            selectedColor={formData.dividerColor || ""}
            containerStyle={{ width: "55%" }}
          />
        </FlexRow>
        <WidthHeightContainer>
          <CustomInput
            type="number"
            name="height"
            value={formData.height || ""}
            placeholder="auto"
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              padding: 2,
              width: "45%",
            }}
            inputStyle={{ width: "35%" }}
            //  isPercentageValidation
          />
          <CustomInput
            type="number"
            name="width"
            placeholder="auto"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "55%",
              // marginLeft: "1rem",
              padding: 2,
            }}
            inputStyle={{ width: "35%" }}
            //  isPercentageValidation
          />
        </WidthHeightContainer>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label={"Select Background color"}
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "55%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "43%" }}
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
