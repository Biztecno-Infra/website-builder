import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { BlockFormProps } from "../types";
import { AlignmentSelector, PaddingInput } from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { ImageProps } from "../../../types";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockForm } from "../useBlockForm";
import { FlexContainer } from "../style";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
  width: 100%;
`;
const PaddingContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ImageBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  const { formData, handleChange, handleImmediateChange } = useBlockForm(
    selectedBlock as ImageProps,
    updateBlock
  );

  // Special handler for imageUrl that needs immediate update
  const handleImageUrlChange = useCallback(
    async (value: string) => {
      handleImmediateChange("imageUrl", value);
    },
    [handleImmediateChange]
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Image">
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
        <CustomInput
          name="imageUrl"
          placeholder="Add Image URL"
          value={formData.imageUrl}
          onChange={(name: string, value: string) =>
            handleImageUrlChange(value)
          }
          containerStyle={{ marginBottom: "0.75rem", padding: 2 }}
          type="text"
        />

        <CustomInput
          name="altText"
          placeholder="Add Alt Text"
          value={formData.altText}
          onChange={(name: string, value: string) =>
            handleChange("altText", value)
          }
          containerStyle={{ marginBottom: "0.75rem", padding: 2 }}
          type="text"
        />
        <CustomInput
          name="navigateToUrl"
          placeholder="Add URL to link image"
          value={formData.navigateToUrl}
          onChange={(name, value) => handleChange("navigateToUrl", value)}
          containerStyle={{ marginBottom: "0.75rem", padding: 2 }}
          type="text"
        />
        <WidthHeightContainer>
          {/* <CustomInput
            type="number"
            name="height"
            value={formData.height || ""}
            placeholder="auto"
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="%"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              padding: 2,
              width: "45%",
            }}
            inputStyle={{ width: "35%" }}
            isPercentageValidation
          /> */}
          <CustomInput
            type="number"
            name="width"
            placeholder="auto"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="%"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "55%",
              // marginLeft: "1rem",
              padding: 2,
            }}
            inputStyle={{ width: "35%" }}
            isPercentageValidation
          />
        </WidthHeightContainer>
        <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "90%" }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <PaddingContainer>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "55%" }}
          />

          <PaddingInput
            padding={formData.padding}
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "48%", paddingLeft: "1rem" }}
          />
        </PaddingContainer>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            border: "none",
            padding: 0,
            width: "95%",
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
