import React, { useEffect, useState } from "react";
import { Jimp } from "jimp";
import { BlockFormProps } from "../types";
import { AlignmentDropdown, PaddingInput } from "@components/StyleComponents";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import CustomCSSRenderer from "./CustomCssRenderer";
import { ImageProps } from "../../../types";
import { Input } from "@components/lib";

export const ImageBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const { 
    imageUrl, 
    altText, 
    width, 
    height, 
    backgroundColor, 
    padding, 
    alignment, 
    borderWidth, 
    borderStyle, 
    borderColor, 
    borderRadius, 
    navigateToUrl,
    customCss = {} ,
  } = selectedBlock as ImageProps;
  
  const [formData, setFormData] = useState({
    imageUrl,
    altText,
    width,
    height,
    backgroundColor,
    padding,
    alignment,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    navigateToUrl 
  });

  useEffect(() => {
    setFormData({
      imageUrl,
      altText,
      width,
      height,
      backgroundColor,
      padding,
      alignment,
      borderWidth,
      borderStyle,
      borderColor,
      borderRadius,
      customCss,
      navigateToUrl
    });
  }, [selectedBlock]);

  const handleImageUrlChange = async (value: string) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev, imageUrl: value };
      updateBlock(selectedBlock.id, "imageUrl", value);
      return updatedFormData;
    });

    try {
      const image = await Jimp.read(value);
      const { width, height } = image.bitmap;

      setFormData((prev) => {
        const updatedFormData = { 
          ...prev, 
          width, 
          height 
        };
        updateBlock(selectedBlock.id, "width", width);
        updateBlock(selectedBlock.id, "height", height);
        return updatedFormData;
      });
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev, [field]: value };
      updateBlock(selectedBlock.id , field , value);
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
    <BasePropertyWrapper name="Image Block">
      <Input
        name="imageUrl"
        label="Image URL"
        placeholder="Enter Image URL"
        value={formData.imageUrl}
        onChange={(name: string, value: string) => handleImageUrlChange(value)} 
      />
      
      <Input
        name="altText"
        label="Alt Text"
        placeholder="Enter Alt Text"
        value={formData.altText}
        onChange={(name: string, value: string) => handleChange("altText", value)}
      />
      
      <Input
        name="navigateToUrl"
        label="Image Navigation URL"
        placeholder="Enter Image Navigation URL"
        value={formData.navigateToUrl}
        onChange={handleChange}
      />
      
      <ReactColorPicker
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label={"Select Background color"}
        selectedColor={formData.backgroundColor}
      />
      <Input
        type="number"
        name="width"
        label="Width"
        placeholder="Enter Width"
        value={formData.width || ""}
        onChange={(name: string, value: string) => handleChange("width", value)}
      />
      <Input
        type="number"
        name="height"
        label="Height"
        placeholder="Enter Height"
        value={formData.height || ""}
        onChange={(name: string, value: string) => handleChange("height", value)}
      />
      <AlignmentDropdown onChange={handleChange} value={formData.alignment} />
      <PaddingInput
        padding={formData.padding}
        onChange={(padding: any) => handleChange("padding", padding)}
      />
      <Input
        name="borderWidth"
        placeholder="Border Width"
        type="number"
        label="Border Width"
        value={formData.borderWidth}
        onChange={handleChange}
      />
      <BorderStyleDropdown value={formData.borderStyle || ""} onChange={handleChange} />
      <ReactColorPicker
        onColorChange={(field, value) => handleChange("borderColor", value)}
        label="Select Border Color"
        selectedColor={formData.borderColor || ""}
      />
      <Input
        name="borderRadius"
        placeholder="Border Radius"
        type="number"
        label="Border Radius"
        value={formData.borderRadius}
        onChange={handleChange}
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
