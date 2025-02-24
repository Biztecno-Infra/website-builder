import React, { useEffect, useState } from "react";
import {
  AlignmentSelector,
  FontFamilyDropdown,
  FontSizeInput,
  FontWeightDropdown,
  PaddingInput,
} from "@components/StyleComponents";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { CustomCSSInput } from "@components/StyleComponents/CustomCSS";
import { TextProps } from "../../../types";
import CustomCSSRenderer from "./CustomCssRenderer";
import { TextArea, Input } from "@components/lib";
import styled from "styled-components";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaddingContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const ColorPickerContainer = styled.div`
  width: 60%;
`;

const PaddingInputContainer = styled.div`
  width: 40%;
`;

export const TextBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    text,
    fontFamily,
    fontSize = 16,
    fontWeight = "400",
    padding,
    textColor,
    backgroundColor,
    alignment,
    customCss = {},
    backgroundImage,
    navigateToUrl,
    lineHeight,
    id: blockId,
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
    lineHeight,
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
      lineHeight,
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
  const parseCSS = (cssString: string) => {
    const cssObject: { [key: string]: string } = {};

    // Split the string by semicolons to separate different CSS rules
    const properties = cssString.split(";");

    properties.forEach((property) => {
      // Trim whitespace and check if the property is not empty
      const trimmedProperty = property.trim();
      if (trimmedProperty) {
        // Split the property into key and value
        const [key, value] = trimmedProperty
          .split(":")
          .map((item) => item.trim());
        if (key && value) {
          // Add to the object
          cssObject[key] = value;
        }
      }
    });

    return cssObject;
  };

  const handleCustomCssChange = (value: string) => {
    // Parse the CSS string into an object
    const parsedCss = parseCSS(value);
    // console.log(parce)

    // Update the form data with the parsed CSS
    setFormData({
      ...formData,
      customCss: parsedCss, // Save the parsed CSS object
    });
  };

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Text">
        <TextArea
          name="content"
          placeholder="Enter Content"
          value={formData.text || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            handleChange("text", value)
          }
        />
        <FontFamilyDropdown
          onChange={handleChange}
          value={formData.fontFamily}
        />

        <FontSizeInput
          fontSize={formData.fontSize}
          onChange={(value: number) => handleChange("fontSize", value)}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("textColor", value)}
          label={"Select Text color"}
          selectedColor={formData.textColor || ""}
        />
        <FontWeightDropdown
          onChange={(field, value) => handleChange(field, value)}
          value={formData.fontWeight}
        />
        <AlignmentSelector onChange={handleChange} value={formData.alignment} />

        <Input
          name="lineHeight"
          label="Line Height"
          placeholder="Enter Line Height"
          value={formData.lineHeight}
          type="number"
          onChange={handleChange}
        />

        <Input
          name="navigateToUrl"
          label="Text Navigation URL"
          placeholder="Enter Text Navigation URL"
          value={formData.navigateToUrl}
          onChange={handleChange}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <PaddingContainer>

          <ColorPickerContainer>
            <ReactColorPicker
              onColorChange={(field, value) =>
                handleChange("backgroundColor", value)
              }
              // label={"Select Background color"}
              selectedColor={formData.backgroundColor}
            />
          </ColorPickerContainer>

          <PaddingInputContainer >
            <PaddingInput
              padding={formData.padding}
              onChange={(padding: any) => handleChange("padding", padding)}
            />
          </PaddingInputContainer>
        </PaddingContainer>
        <Input
          name="backgroundImage"
          placeholder="Enter Background Image Url"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
          label="Background Image"
        />
      </BasePropertyWrapper>
      {/* <CustomCSSInput label="Additional CSS" onAddProperty={addCustomCSS} />
      <CustomCSSRenderer
        customCss={formData.customCss}
        handleDeleteCSS={handleDeleteCSS}
        handleEditCSS={handleEditCSS}
      /> */}

      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={JSON.stringify(formData.customCss) || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            handleCustomCssChange(value)
          }
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
