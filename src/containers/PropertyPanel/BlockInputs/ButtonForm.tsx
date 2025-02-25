import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import {
  FontFamilyDropdown,
  FontSizeInput,
  FontWeightDropdown,
  PaddingInput,
  AlignmentSelector,
} from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import CustomCSSRenderer from "./CustomCssRenderer";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";
import { Input, TextArea } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background:#DDDDDD ;
`
const FlexRow = styled.div`
  display: flex;
  margin-top: 5px;
  margin-bottom: 10px;
`
const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
`
export const ButtonBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    id,
    buttonText,
    navigateToUrl,
    textColor,
    backgroundColor,
    buttonColor,
    fontFamily,
    fontSize,
    fontWeight,
    alignment,
    padding = defaultPadding,
    borderRadius,
    borderColor,
    borderWidth = "",
    borderStyle,
    buttonPadding,
    width,
    height,
    customCss = {},
  } = selectedBlock as ButtonProps;

  const [formData, setFormData] = useState({
    buttonText,
    navigateToUrl,
    textColor,
    backgroundColor,
    buttonColor,
    fontFamily,
    fontSize,
    fontWeight,
    alignment,
    padding,
    borderRadius,
    borderColor,
    borderWidth,
    borderStyle,
    customCss,
    buttonPadding,
    width,
    height,
  });

  useEffect(() => {
    setFormData({
      buttonText,
      navigateToUrl,
      textColor,
      backgroundColor,
      buttonColor,
      fontFamily,
      fontSize,
      fontWeight,
      alignment,
      padding,
      borderRadius,
      borderColor,
      borderWidth,
      borderStyle,
      customCss,
      buttonPadding,
      width,
      height,
    });
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [property]: value };
      updateBlock(id, property, value);
      return updatedData;
    });
  };

  const addCustomCSS = (property: string, value: string) => {
    const updatedCustomCss = { ...formData.customCss, [property]: value };
    setFormData((prevData) => ({ ...prevData, customCss: updatedCustomCss }));
    updateBlock(id, "customCss", updatedCustomCss);
  };

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Button Text" containerStyle={{ padding: "1rem" }}>
        <Input
          name="buttonText"
          label="Button Text"
          placeholder="Enter button text here"
          value={formData.buttonText}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: '90%' }}
        />

        <FlexRow>
          <FontFamilyDropdown
            onChange={handleChange}
            value={formData.fontFamily}
            style={{ width: "60%", }}
          />
          <Input
            name="fontSize"
            placeholder="Enter font size"
            value={fontSize}
            onChange={handleChange}
            type="text"
            containerStyle={{ width: "26%", marginLeft: "0.5rem" }}
            unitsLabel="px"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("textColor", value)}
            label="Select Text color"
            selectedColor={formData.textColor || ""}
            containerStyle={{ width: "60%" }}
          />
          <FontWeightDropdown
            onChange={handleChange}
            value={formData.fontWeight}
            fontWeightStyle={{ width: "26%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>


        <AlignmentSelector onChange={handleChange} value={formData.alignment} containerStyle={{ width: "60%", }} />
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper name="Edit Button" containerStyle={{ padding: "1rem" }}>
        <WidthHeightContainer>
          <Input
            type="number"
            name="width"
            label="Width"
            placeholder="Enter Button Width"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              width: "40%",
            }}
          />
          <Input
            type="number"
            name="height"
            label="Height"
            placeholder="Enter Button Height"
            value={formData.height || ""}
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "40%",
              marginLeft: "1rem"
            }}
          />
        </WidthHeightContainer>
        <Input
          name="navigateToUrl"
          label="Button Navigation URL"
          placeholder="Enter Button Navigation URL"
          value={formData.navigateToUrl}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: '90%' }}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("buttonColor", value)}
          selectedColor={formData.buttonColor || ""}
          containerStyle={{ width: "60%" }}
        />


        <FlexRow>
          <AlignmentSelector onChange={handleChange} value={formData.alignment} containerStyle={{ width: "50%", }} />
          <PaddingInput
            padding={formData.padding}
            onChange={(value) => handleChange("padding", value)}
            containerStylePopUp={{ width: '35%', paddingLeft: '0.5rem' }}
          />
        </FlexRow>

      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper name="Edit Container" containerStyle={{ padding: "1rem", width: '95%' }}>
        <ReactColorPicker
          onColorChange={(field, value) =>
            handleChange("backgroundColor", value)
          }
          label="Select Background Color"
          selectedColor={formData.backgroundColor}
          containerStyle={{ width: "50%" }}
        />
        <BasePropertyWrapper name="Border Properties" labelColor={{ color: "#111111", paddingTop: "1rem", width: '100%' }}>
          <BorderStyleDropdown
            onChange={handleChange}
            borderWidth={formData.borderWidth}
            borderStyle={formData.borderStyle}
            borderColor={formData.borderColor}
            borderRadius={formData.borderRadius}
            containerStyle={{ border: "1px solid #DDDDDD", borderRadius: "10px", padding: "0.5rem" }}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper name="Additional Properties" containerStyle={{ padding: "1rem" }}>
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={JSON.stringify(formData.customCss) || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            // handleCustomCssChange(value)
            console.log(value)
          }
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
