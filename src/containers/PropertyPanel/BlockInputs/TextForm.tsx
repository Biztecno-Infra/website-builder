import React, { useEffect, useState } from "react";
import {
  AlignmentDropdown,
  FontFamilyDropdown,
  FontSizeInput,
  FontWeightDropdown,
  PaddingInput,
} from "@components/StyleComponents";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import { defaultPadding } from "@utils/constant";
import { TextProps } from "../../../types";
import CustomCSSRenderer from "./CustomCssRenderer";
import { TextArea , Input } from "@components/lib";

export const TextBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const { 
    text, 
    fontFamily, 
    fontSize = 16, 
    fontWeight = "400", 
    padding , 
    textColor , 
    backgroundColor, 
    alignment, 
    customCss = {}, 
    backgroundImage,
    navigateToUrl,
    lineHeight ,  
    id: blockId 
  } = selectedBlock as TextProps;
  
  const [formData, setFormData] = useState({
    text,
    fontFamily,
    fontSize,
    fontWeight,
    padding,
    textColor,
    backgroundColor,
    alignment,
    backgroundImage,
    customCss,
    navigateToUrl,
    lineHeight
  });
  
  useEffect(() => {
    setFormData({
      text,
      fontFamily,
      fontSize,
      fontWeight,
      padding,
      textColor,
      backgroundColor,
      alignment,
      backgroundImage,
      customCss,
      navigateToUrl,
      lineHeight
    });
  }, [selectedBlock]); 
  

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [field]: value,
      };

      updateBlock(blockId, field, value);

      return updatedFormData;
    });
  };

  const addCustomCSS = (property: string, value: string) => {
    setFormData((prev) => {
      const updatedCustomCss = {
        ...prev.customCss,
        [property]: value,
      };
      const updatedFormData = { ...prev, customCss: updatedCustomCss };
      updateBlock(selectedBlock.id , property , value);
      return updatedFormData;
    });
  };

  const handleDeleteCSS = (property: string) => {
    setFormData((prev) => {
      const updatedCustomCss = { ...prev.customCss };
      delete updatedCustomCss[property];
      const updatedFormData = { ...prev, customCss: updatedCustomCss };
      updateBlock(selectedBlock.id , customCss , updatedCustomCss);
      return updatedFormData;
    });
  };

  const handleEditCSS = (property: string, value: string) => {
    setFormData((prev) => {
      const updatedCustomCss = {
        ...prev.customCss,
        [property]: value,
      };
      const updatedFormData = { ...prev, customCss: updatedCustomCss };
      updateBlock(selectedBlock.id , property , value);
      return updatedFormData;
    });
  };

  return (
    <BasePropertyWrapper name="Text Block">
      <TextArea
        name="content"
        label="Content"
        placeholder="Enter Content"
        value={formData.text || ""}
        onChange={(name: string, value: string) => handleChange("text", value)}
        // numberOfrows={5}
      />
      <Input
        name="navigateToUrl"
        label="Text Navigation URL"
        placeholder="Enter Text Navigation URL"
        value={formData.navigateToUrl}
        onChange={handleChange}
      />

      <Input
        name="backgroundImage"
        placeholder="Enter Background Image Url"
        value={formData.backgroundImage}
        onChange={(name, value) => handleChange(name, value)}
        label="Background Image"
      />

      <ReactColorPicker
        onColorChange={(field, value) => handleChange("textColor", value)}
        label={"Select Text color"}
        selectedColor={formData.textColor || ""}
      />

      <ReactColorPicker
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label={"Select Background color"}
        selectedColor={formData.backgroundColor}
      />

      <FontFamilyDropdown onChange={handleChange} value={formData.fontFamily} />

      <AlignmentDropdown onChange={handleChange} value={formData.alignment} />

      <FontSizeInput
        fontSize={formData.fontSize}
        onChange={(value: number) => handleChange("fontSize", value)}
      />
      <Input
        name="lineHeight"
        label="Line Height"
        placeholder="Enter Line Height"
        value={formData.lineHeight}
        onChange={handleChange}
      />
      <FontWeightDropdown
        onChange={(field, value) => handleChange(field, value)}
        value={formData.fontWeight}
      />

      <PaddingInput
        padding={formData.padding}
        onChange={(padding: any) => handleChange("padding", padding)}
      />
      <CustomCSSInput label="Additional CSS" onAddProperty={addCustomCSS} />
      <CustomCSSRenderer
        customCss={formData.customCss}
        handleDeleteCSS={handleDeleteCSS}
        handleEditCSS={handleEditCSS}
      />
    </BasePropertyWrapper>
  );
};
