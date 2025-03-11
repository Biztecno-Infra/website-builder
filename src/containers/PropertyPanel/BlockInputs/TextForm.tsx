import React, { useEffect, useState } from "react";
import {
  AlignmentSelector,
  PaddingInput,
} from "@components/StyleComponents";
import {  ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { TextProps } from "../../../types";
import { TextArea, Input ,Dropdown } from "@components/lib";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";
import { FlexRow, FormWrapper } from "../style";
import { fontOptions, fontWeightOptions } from "../constant";

const ColorPickerContainer = styled.div`
  width: 65%;
  margin-top: 5px;
  margin-bottom: 10px;
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
    color , 
    backgroundColor,
    alignment,
    customCss,
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
    color,
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
      color,
      backgroundColor,
      alignment,
      backgroundImage,
      customCss,
      navigateToUrl,
      lineHeight,
    });
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {  
    console.log(property , value)
    setFormData((prevData) => {
      const updatedData = { ...prevData, [property]: value };
      updateBlock(blockId, property, value);  
      console.log(property , value , updatedData)
      return updatedData;
    });
  };
  
console.log(selectedBlock)
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
        <FlexRow style={{ marginTop: "10px" }}>
          <Dropdown
            name="fontFamily"
            options={fontOptions}
            onChange={(name, value) =>
              handleChange("fontFamily", value as string)
            }
            containerStyle={{ width: "65%" }}
            initialValue={formData.fontFamily}
          />
          <Input
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize || ''} 
            onChange={(name, value) => handleChange("fontSize", value)}
            containerStyle={{
              width: "26%",
              padding: 3,
              borderRadius: "5px",
              alignItems: "center",
              background: "#F1F1F1",
            }}
            inputStyle={{width: "40%"}}
            unitsLabel="px"
            type="number"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("color", value)}
            selectedColor={formData.color || ""}
            containerStyle={{ width: "65%" }}
          />
          <Dropdown
            name="fontWeight"
            options={fontWeightOptions}
            onChange={handleChange}
            initialValue={formData.fontWeight}
            containerStyle={{ width: "28%" }}
          />
        </FlexRow>
        <ColorPickerContainer>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
          />
        </ColorPickerContainer>
        <FlexRow>
          <Input
            name="lineHeight"
            placeholder="Enter Line Height"
            value={formData.lineHeight || ''} 
            type="number"
            onChange={handleChange}
            iconProps={{
              name: CUSTOM_SVG_ICON.LineHeight,
              size: SizeEnum.Small,
            }}
            containerStyle={{ width: "25%", padding: 3 }}
            inputStyle={{width: "50%"}}
          />
          <Input
            name="navigateToUrl"
            placeholder="Add URL to link text"
            value={formData.navigateToUrl}
            onChange={handleChange}
            containerStyle={{ width: "68%", padding: 3 }}
          />
        </FlexRow>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "60%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "35%" }}
          />
        </FlexRow>
        <Input
          name="backgroundImage"
          placeholder="Add background image URL"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
          containerStyle={{ padding: 3, marginBottom: 10 }}
        />
      </BasePropertyWrapper>
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
