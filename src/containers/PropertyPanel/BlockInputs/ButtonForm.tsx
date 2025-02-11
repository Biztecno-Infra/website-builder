import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import {
  FontFamilyDropdown,
  FontSizeInput,
  FontWeightDropdown,
  PaddingInput,
  AlignmentDropdown,
} from "@components/StyleComponents";
import { ColorPicker, CustomInput } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import CustomCSSRenderer from "./CustomCssRenderer";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";

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
    borderWidth, 
    borderStyle, 
    buttonPadding , 
    width , 
    height ,
    customCss = {} 
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
    width , 
    height
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
      width , 
      height
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
    <BasePropertyWrapper name="Button Block">
      <CustomInput
        id="buttonText"
        name="buttonText"
        label="Button Text"
        placeholder="Enter Button Text"
        value={formData.buttonText}
        onChange={handleChange}
      />
    <CustomInput
        type="number"
        id="width"
        name="width"
        label="Width"
        placeholder="Enter Button Width"
        value={formData.width || ""}
        onChange={(name: string, value: string) => handleChange("width", value)}
      />
      <CustomInput
        type="number"
        id="height"
        name="height"
        label="Height"
        placeholder="Enter Button Height"
        value={formData.height || ""}
        onChange={(name: string, value: string) => handleChange("height", value)}
      />
      <CustomInput
        id="navigateToUrl"
        name="navigateToUrl"
        label="Button Navigation URL"
        placeholder="Enter Button Navigation URL"
        value={formData.navigateToUrl}
        onChange={handleChange}
      />
      <ColorPicker
        type="textColor"
        onColorChange={(field, value) => handleChange("textColor", value)}
        label="Select Text color"
        selectedColor={formData.textColor || ""}
      />
      <ColorPicker
        type="bgColor"
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label="Select Background Color"
        selectedColor={formData.backgroundColor}
      />
      <ColorPicker
        type="buttonColor"
        onColorChange={(field, value) => handleChange("buttonColor", value)}
        label="Select Button Color"
        selectedColor={formData.buttonColor || ""}
      />
      <PaddingInput
        mainLabel="Button Padding"
        padding={formData.buttonPadding}
        onChange={(value) => handleChange("buttonPadding", value)}
      />

      <FontFamilyDropdown onChange={handleChange} value={formData.fontFamily} />
      <FontSizeInput
        fontSize={formData.fontSize}
        onChange={(value) => handleChange("fontSize", value)}
      />
      <FontWeightDropdown onChange={handleChange} value={formData.fontWeight} />
      <AlignmentDropdown onChange={handleChange} value={formData.alignment} />
      <PaddingInput
        padding={formData.padding}
        onChange={(value) => handleChange("padding", value)}
      />
      <BorderStyleDropdown
        onChange={handleChange}
        value={formData.borderStyle || ""}
      />
      <CustomInput
        id="borderWidth"
        name="borderWidth"
        label="Border Width"
        placeholder="Enter Border Width (px)"
        value={formData.borderWidth}
        type="number"
        onChange={handleChange}
      />
      <ColorPicker
        type="borderColor"
        onColorChange={(field, value) => handleChange("borderColor", value)}
        label="Select Border Color"
        selectedColor={formData.borderColor || ""}
      />
      <CustomInput
        id="borderRadius"
        name="borderRadius"
        label="Border Radius"
        placeholder="Enter Border Radius (px)"
        value={formData.borderRadius}
        type="number"
        onChange={handleChange}
      />
      <CustomCSSInput label="Additional CSS" onAddProperty={addCustomCSS} />
      <CustomCSSRenderer
        customCss={formData.customCss}
        handleDeleteCSS={(property) =>
          handleChange("customCss", formData.customCss)
        }
        handleEditCSS={(property, value) =>
          handleChange("customCss", formData.customCss)
        }
      />
    </BasePropertyWrapper>
  );
};
