import React, { useEffect, useState } from "react";
import {
  AlignmentSelector,
  FontFamilyDropdown,
  FontWeightDropdown,
  PaddingInput,
} from "@components/StyleComponents";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { TextProps } from "../../../types";
import { TextArea, Input } from "@components/lib";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";
import { FlexRow, FormWrapper } from "../style";

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
    textColor,
    backgroundColor,
    alignment,
    customCss ,
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
        <FlexRow style={{marginTop: "10px"}}>
          <FontFamilyDropdown
            onChange={handleChange}
            value={formData.fontFamily}
            style={{ width: "65%" }}
          />
          <Input
            name="fontSize"
            placeholder="Enter font size"
            value={fontSize}
            onChange={handleChange}
            containerStyle={{
              width: "26%",
              padding: 3,
              borderRadius: "5px",
              alignItems: "center",
              background: "#F1F1F1",
            }}
            unitsLabel="px"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("textColor", value)}
            selectedColor={formData.textColor || ""}
            containerStyle={{ width: "65%" }}
          />
          <FontWeightDropdown
            onChange={(field, value) => handleChange(field, value)}
            value={formData.fontWeight}
            fontWeightStyle={{ width: "28%" }}
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
            value={formData.lineHeight}
            type="number"
            onChange={handleChange}
            iconProps={{
              name: CUSTOM_SVG_ICON.LineHeight,
              size: SizeEnum.Small,
            }}
            containerStyle={{ width: "25%", padding: 3 }}
          />
          <Input
            name="navigateToUrl"
            placeholder="Enter Text Navigation URL"
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
          placeholder="Enter Background Image Url"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
          containerStyle={{ padding: 3, marginBottom: 10 }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={JSON.stringify(formData.customCss) || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            handleChange("customCss", value)
          }
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
