import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import { PaddingInput, AlignmentSelector } from "@components/StyleComponents";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";
import { CustomInput, TextArea, Dropdown, ReactColorPicker } from "@components/lib";
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
    color,
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
    color,
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
      color,
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
        <CustomInput
          name="buttonText"
          placeholder="Enter button text here"
          value={formData.buttonText}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: "95%", padding: 2 }}
        />

        <FlexRow>
          <Dropdown
            name="fontFamily"
            onChange={handleChange}
            options={fontOptions}
            initialValue={formData.fontFamily}
            containerStyle={{ width: "60%" }}
          />

          <CustomInput
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize || ""}
            onChange={handleChange}
            type="number"
            containerStyle={{ width: "30%", padding: 3 }}
            inputStyle={{ width: "45%" }}
            unitsLabel="px"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("color", value)}
            label="Select Text color"
            selectedColor={formData.color || ""}
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

        {/* <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "60%" }}
        /> */}
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper
        name="Edit Button"
        containerStyle={{ padding: "1rem" }}
      >
        <WidthHeightContainer>
          <CustomInput
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
            inputStyle={{ width: "35%" }}
            containerStyle={{
              width: "40%",
              padding: 2
            }}
          />
          <CustomInput
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
            inputStyle={{ width: "35%" }}
            containerStyle={{
              width: "40%",
              marginLeft: "1rem",
              padding: 2
            }}
          />
        </WidthHeightContainer>
        <CustomInput
          name="navigateToUrl"
          placeholder="Enter Button Navigation URL"
          value={formData.navigateToUrl}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", width: "90%", padding: 2 }}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("buttonColor", value)}
          selectedColor={formData.buttonColor || ""}
          containerStyle={{ width: "90%", marginBottom: 10 }}
        />

        <FlexRow>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
            containerStyle={{ width: "53%" , padding: 8 }}
          />
          <PaddingInput
            padding={formData.buttonPadding}
            onChange={(value) => handleChange("buttonPadding", value)}
            containerStylePopUp={{ width: "45%", }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            border: "none",
            padding: 0,
            width: "95%",
            marginTop: "0.5rem"
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
            containerStyle={{ width: "58%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(value) => handleChange("padding", value)}
            containerStylePopUp={{ width: "45%", paddingLeft: "0.5rem" }}
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
