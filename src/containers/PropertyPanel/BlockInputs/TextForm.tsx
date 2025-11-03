import React, { useCallback } from "react";
import { AlignmentSelector, PaddingInput } from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { TextProps } from "../../../types";
import {
  TextArea,
  CustomInput,
  Dropdown,
  ReactColorPicker,
} from "@components/lib";
import styled, { useTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";
import { FlexContainer, FlexRow, FormWrapper } from "../style";
import { fontOptions, fontWeightOptions } from "../constant";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import RichTextEditor from "./RichTextEditor";
import { useBlockForm } from "../useBlockForm";

const ColorPickerContainer = styled.div`
  width: 65%;
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const TextBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
  selectedBrand
}) => {
  const theme = useTheme();
  const { formData, handleChange, handleImmediateChange } = useBlockForm(
    selectedBlock as TextProps,
    updateBlock
  );

  const handleFontSizeChange = useCallback(
    (property: string, value: any) => {
      const fontSizeValue = parseFloat(value);
      handleImmediateChange(property, value);
      handleImmediateChange("lineHeight", fontSizeValue);
    },
    [handleImmediateChange]
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Text">
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
        <RichTextEditor
          textContent={formData.text || ""}
          handleChange={(name, value) => handleChange("text", value)}
        />
        <FlexRow style={{ marginTop: "10px" }}>
          <Dropdown
            name="fontFamily"
            options={fontOptions}
            onChange={(name, value) => handleChange("fontFamily", value)}
            containerStyle={{ width: "65%" }}
            initialValue={formData.fontFamily}
          />
          <CustomInput
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize}
            onChange={handleFontSizeChange}
            containerStyle={{
              width: "30%",
            }}
            inputStyle={{ width: "40%" }}
            unitsLabel="px"
            type="number"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("color", value)}
            selectedColor={formData.color || ""}
            containerStyle={{ width: "65%" }}
            selectedBrand={selectedBrand}
          />
          <Dropdown
            name="fontWeight"
            options={fontWeightOptions}
            onChange={(name, value) => handleChange("fontWeight", value)}
            initialValue={formData.fontWeight}
            containerStyle={{ width: "28%" }}
          />
        </FlexRow>
        <ColorPickerContainer>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
          />
        </ColorPickerContainer>
        <FlexRow>
          <CustomInput
            name="lineHeight"
            placeholder="Enter Line Height"
            value={formData.lineHeight}
            type="number"
            onChange={(name, value) => handleChange("lineHeight", value)}
            iconProps={{
              name: CUSTOM_SVG_ICON.LineHeight,
              size: SizeEnum.Small,
            }}
            containerStyle={{ width: "25%" }}
            inputStyle={{ width: "60%", marginLeft: 4 }}
          />
          <CustomInput
            name="navigateToUrl"
            placeholder="Add URL to link text"
            value={formData.navigateToUrl}
            onChange={(name, value) => handleChange("navigateToUrl", value)}
            containerStyle={{ width: "68%" }}
          />
        </FlexRow>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Text Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
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

        <CustomInput
          type="number"
          name="width"
          placeholder="Width"
          value={formData.width || ""}
          onChange={(name, value) => handleChange("width", value)}
          unitsLabel="px"
          iconProps={{
            name: CUSTOM_SVG_ICON.ImageWidth,
          }}
          inputStyle={{ width: "40%" }}
          containerStyle={{
            width: "50%",
            padding: 2,
          }}
        />
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
            selectedBrand={selectedBrand}
            containerStyle={{
              border: "1px solid #DDDDDD",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("textContainerBackgroundColor", value)
            }
            selectedColor={formData.textContainerBackgroundColor || ""}
            containerStyle={{ width: "53%" }}
            selectedBrand={selectedBrand}
          />
          <PaddingInput
            padding={formData.textContainerPadding}
            onChange={(padding) =>
              handleChange("textContainerPadding", padding)
            }
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
        {/* <CustomInput
          name="backgroundImage"
          placeholder="Add background image URL"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
          containerStyle={{ padding: 3, marginBottom: 10 }}
        /> */}
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
            backgroundImage={formData.backgroundImage || ""}
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
