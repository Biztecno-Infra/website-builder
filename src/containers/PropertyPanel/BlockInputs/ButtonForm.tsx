import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import { PaddingInput, AlignmentSelector } from "@components/StyleComponents";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";
import { Input, TextArea, Dropdown } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexRow, FormWrapper } from "../style";
import { fontOptions, fontWeightOptions } from "../constant";

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
`;
const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
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
    customCss,
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

  return (
    <FormWrapper>
      <BasePropertyWrapper
        name="Edit Button Text"
        containerStyle={{ padding: "1rem" }}
      >
        <Input
          name="buttonText"
          placeholder="Enter button text here"
          value={formData.buttonText}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: "90%" }}
        />

        <FlexRow>
          <Dropdown
            name="fontFamily"
            onChange={handleChange}
            options={fontOptions}
            initialValue={formData.fontFamily}
            containerStyle={{ width: "60%" }}
          />

          <Input
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize || ""}
            onChange={handleChange}
            type="number"
            containerStyle={{ width: "26%", marginLeft: "0.5rem", padding: 3 }}
            inputStyle={{ width: "40%" }}
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

          <Dropdown
            name="fontWeight"
            options={fontWeightOptions}
            onChange={(name, value) =>
              handleChange("fontWeight", value as string)
            }
            initialValue={formData.fontWeight}
            containerStyle={{ width: "26%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>

        <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "60%" }}
        />
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper
        name="Edit Button"
        containerStyle={{ padding: "1rem" }}
      >
        <WidthHeightContainer>
          <Input
            type="number"
            name="width"
            placeholder="Enter Button Width"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "40%",
              paddingRight: "0.5rem",
            }}
          />
          <Input
            type="number"
            name="height"
            placeholder="Enter Button Height"
            value={formData.height || ""}
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              width: "40%",
              marginLeft: "1rem",
              paddingRight: "0.5rem",
            }}
          />
        </WidthHeightContainer>
        <Input
          name="navigateToUrl"
          placeholder="Enter Button Navigation URL"
          value={formData.navigateToUrl}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: "90%" }}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("buttonColor", value)}
          selectedColor={formData.buttonColor || ""}
          containerStyle={{ width: "60%", marginBottom: 10 }}
        />

        <FlexRow>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
            containerStyle={{ width: "60%" }}
          />
          <PaddingInput
            padding={formData.buttonPadding}
            onChange={(value) => handleChange("buttonPadding", value)}
            containerStylePopUp={{ width: "40%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            border: "none",
            padding: "0% 0% 0% 0%",
            width: "95%",
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
      <Divider />
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label="Select Background Color"
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "60%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(value) => handleChange("padding", value)}
            containerStylePopUp={{ width: "40%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={formData.customCss || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            handleChange("customCss", value)
          }
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
