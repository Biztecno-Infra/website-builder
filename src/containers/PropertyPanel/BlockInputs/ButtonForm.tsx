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

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

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
      <BasePropertyWrapper name="Edit Button Text">
        <Input
          name="buttonText"
          label="Button Text"
          placeholder="Enter button text here"
          value={formData.buttonText}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="width"
          label="Width"
          placeholder="Enter Button Width"
          value={formData.width || ""}
          onChange={(name: string, value: string) =>
            handleChange("width", value)
          }
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
        />
        <Input
          name="navigateToUrl"
          label="Button Navigation URL"
          placeholder="Enter Button Navigation URL"
          value={formData.navigateToUrl}
          onChange={handleChange}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("textColor", value)}
          label="Select Text color"
          selectedColor={formData.textColor || ""}
        />
        <PaddingInput
          mainLabel="Button Padding"
          padding={formData.buttonPadding}
          onChange={(value) => handleChange("buttonPadding", value)}
        />

        <ReactColorPicker
          onColorChange={(field, value) => handleChange("buttonColor", value)}
          label="Select Button Color"
          selectedColor={formData.buttonColor || ""}
        />

        <FontFamilyDropdown
          onChange={handleChange}
          value={formData.fontFamily}
        />
         <Input
            name="fontSize"
            placeholder="Enter font size"
            value={fontSize}
            onChange={handleChange}
            // type="number"
            containerStyle={{ width: "26%", padding: 3, borderRadius: "5px" , alignItems:"center" }}
            unitsLabel="px"
          />
        <FontWeightDropdown
          onChange={handleChange}
          value={formData.fontWeight}
        />
        <AlignmentSelector onChange={handleChange} value={formData.alignment} />
      </BasePropertyWrapper>

      <BasePropertyWrapper name="Edit Container">
        <ReactColorPicker
          onColorChange={(field, value) =>
            handleChange("backgroundColor", value)
          }
          label="Select Background Color"
          selectedColor={formData.backgroundColor}
        />

        <PaddingInput
          padding={formData.padding}
          onChange={(value) => handleChange("padding", value)}
        />
        <BasePropertyWrapper name="Border Properties">
          <BorderStyleDropdown
            onChange={handleChange}
            borderWidth={formData.borderWidth}
            borderStyle={formData.borderStyle}
            borderColor={formData.borderColor}
            borderRadius={formData.borderRadius}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Additional Properties">
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
