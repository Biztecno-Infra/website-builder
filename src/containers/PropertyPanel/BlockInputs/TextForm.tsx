import React, { useEffect, useState } from "react";
import { AlignmentSelector, PaddingInput } from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { TextProps } from "../../../types";
import {
  TextArea,
  CustomInput,
  Dropdown,
  ReactColorPicker,
} from "@components/lib";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";
import { FlexRow, FormWrapper } from "../style";
import { fontOptions, fontWeightOptions } from "../constant";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";

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
    color,
    backgroundColor,
    alignment,
    customCss,
    backgroundImage,
    navigateToUrl,
    lineHeight,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    id: blockId,
    layerName,
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
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    layerName,
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
      backgroundPosition,
      backgroundRepeat,
      backgroundSize,
      layerName,
    });
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {
    setFormData((prevData) => {
      const newFontSize =
        property === "fontSize" ? parseFloat(value) : prevData.fontSize;
      return {
        ...prevData,
        [property]: value,
        ...(property === "fontSize" && { lineHeight: newFontSize }),
      };
    });

    updateBlock(blockId, property, value);
    if (property === "fontSize")
      updateBlock(blockId, "lineHeight", parseFloat(value));
  };

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Text">
        <CustomInput
          name="layerName"
          placeholder="Enter Layer Name"
          value={formData.layerName || ""}
          onChange={(name, value) => handleChange("layerName", value)}
          containerStyle={{
            width: "100%",
            marginBottom: "10px",
          }}
        />
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
          <CustomInput
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize}
            onChange={(name, value) => handleChange("fontSize", value)}
            containerStyle={{
              width: "30%",
            }}
            inputStyle={{ width: "40%" }}
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
          <CustomInput
            name="lineHeight"
            placeholder="Enter Line Height"
            value={formData.lineHeight}
            type="number"
            onChange={handleChange}
            iconProps={{
              name: CUSTOM_SVG_ICON.LineHeight,
              size: SizeEnum.Small,
            }}
            containerStyle={{ width: "25%" }}
            inputStyle={{ width: "60%", marginLeft: 4 }}
          />
          <CustomInput
            name="navigateToUrl"
            placeholder="Add URL to link text"
            value={formData.navigateToUrl}
            onChange={handleChange}
            containerStyle={{ width: "68%" }}
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
            containerStyle={{ width: "53%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
        {/* <CustomInput
          name="backgroundImage"
          placeholder="Add background image URL"
          value={formData.backgroundImage}
          onChange={(name, value) => handleChange(name, value)}
          containerStyle={{ padding: 3, marginBottom: 10 }}
        /> */}
        <BasePropertyWrapper
          name="Background Properties"
          subLabel
          containerStyle={{
            padding: 0,
            width: "95%",
            border: "none",
            marginTop: "0.5rem",
          }}
        >
          <BackgroundProperties
            onChange={handleChange}
            backgroundImage={formData.backgroundImage || ""}
            backgroundPosition={formData.backgroundPosition || ""}
            backgroundRepeat={formData.backgroundRepeat || ""}
            backgroundSize={formData.backgroundSize || ""}
            containerStyle={{
              border: "1px solid #DDDDDD",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          />
        </BasePropertyWrapper>
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
