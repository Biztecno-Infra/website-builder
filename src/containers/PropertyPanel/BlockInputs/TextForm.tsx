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
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          <FontFamilyDropdown
            onChange={handleChange}
            value={formData.fontFamily}
            style={{ width: "70%" }}
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
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("textColor", value)}
            label={"Select Text color"}
            selectedColor={formData.textColor || ""}
          />
          <FontWeightDropdown
            onChange={(field, value) => handleChange(field, value)}
            value={formData.fontWeight}
          />
        </div>
        <div style={{ width: "60%" }}>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          <Input
            name="lineHeight"
            placeholder="Enter Line Height"
            value={formData.lineHeight}
            type="number"
            onChange={handleChange}
            iconProps={{
              name: CUSTOM_SVG_ICON.LineHeight,
            }}
            containerStyle={{
              width: "35%",
            }}
          />

          <Input
            name="navigateToUrl"
            placeholder="Enter Text Navigation URL"
            value={formData.navigateToUrl}
            onChange={handleChange}
            containerStyle={{
              width: "60%",
            }}
          />
        </div>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <ReactColorPicker
          onColorChange={(field, value) =>
            handleChange("backgroundColor", value)
          }
          label={"Select Background color"}
          selectedColor={formData.backgroundColor}
        />

        <PaddingInput
          padding={formData.padding}
          onChange={(padding: any) => handleChange("padding", padding)}
        />
        <Input
          name="backgroundImage"
          placeholder="Enter Background Image Url"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
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
