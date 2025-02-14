import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import {
  FontFamilyDropdown,
  FontSizeInput,
  FontWeightDropdown,
  PaddingInput,
  AlignmentDropdown,
} from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import CustomCSSRenderer from "./CustomCssRenderer";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";
import { Input } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";

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
      <Input
        name="buttonText"
        label="Button Text"
        placeholder="Enter Button Text"
        value={formData.buttonText}
        onChange={handleChange}
      />
    <Input
        type="number"
        name="width"
        label="Width"
        placeholder="Enter Button Width"
        value={formData.width || ""}
        onChange={(name: string, value: string) => handleChange("width", value)}
      />
      <Input
        type="number"
        name="height"
        label="Height"
        placeholder="Enter Button Height"
        value={formData.height || ""}
        onChange={(name: string, value: string) => handleChange("height", value)}
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
      <ReactColorPicker
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label="Select Background Color"
        selectedColor={formData.backgroundColor}
      />
      <ReactColorPicker
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
      <Input
        name="borderWidth"
        label="Border Width"
        placeholder="Enter Border Width (px)"
        value={formData.borderWidth}
        type="number"
        onChange={handleChange}
      />
      <ReactColorPicker
        onColorChange={(field, value) => handleChange("borderColor", value)}
        label="Select Border Color"
        selectedColor={formData.borderColor || ""}
      />
      <Input
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
