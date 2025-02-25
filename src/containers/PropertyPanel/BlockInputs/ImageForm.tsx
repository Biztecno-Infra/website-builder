import React, { useEffect, useState } from "react";
import { Jimp } from "jimp";
import { BlockFormProps } from "../types";
import { AlignmentSelector, PaddingInput } from "@components/StyleComponents";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { ImageProps } from "../../../types";
import { Input, TextArea } from "@components/lib";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
  width: 100%;
`
const PaddingContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
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
    customCss = {},
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
    navigateToUrl,
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
      navigateToUrl,
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
          height,
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
      updateBlock(selectedBlock.id, field, value);
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
      updateBlock(selectedBlock.id, property, value);
      return updatedFormData;
    });
  };

  const handleDeleteCSS = (property: string) => {
    setFormData((prev) => {
      const updatedCustomCss = { ...prev.customCss };
      delete updatedCustomCss[property];
      const updatedFormData = { ...prev, customCss: updatedCustomCss };
      updateBlock(selectedBlock.id, customCss, updatedCustomCss);
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
      updateBlock(selectedBlock.id, property, value);
      return updatedFormData;
    });
  };

  return (
    <FormWrapper>

      <BasePropertyWrapper name="Edit Image">
        <Input
          name="imageUrl"
          placeholder="Add Image URL"
          value={formData.imageUrl}
          onChange={(name: string, value: string) =>
            handleImageUrlChange(value)
          }
          containerStyle={{ marginBottom: "0.75rem"}}
        />

        <Input
          name="altText"
          placeholder="Add Alt Text"
          value={formData.altText}
          onChange={(name: string, value: string) =>
            handleChange("altText", value)
          }
          containerStyle={{ marginBottom: "0.75rem" }}
        />
        <Input
          name="navigateToUrl"
          placeholder="Add URL to link image"
          value={formData.navigateToUrl}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem" }}
        />
        <WidthHeightContainer>
          <Input
            type="text"
            name="width"
            // placeholder="Enter Width"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              width: "45%"
            }}
          />
          <Input
            type="text"
            name="height"
            // placeholder="Enter Height"
            value={formData.height || ""}
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "45%",
              marginLeft: "1rem"
            }}
          />
        </WidthHeightContainer>
        <AlignmentSelector onChange={handleChange} value={formData.alignment} containerStyle={{ width: "60%", }} />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <PaddingContainer>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            // label={"Select Background color"}
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "50%" }}
          />

          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: '40%', paddingLeft: '1rem' }}
          />
        </PaddingContainer>
        <BasePropertyWrapper name="Border Properties" labelColor={{ color: "#111111", paddingTop: "1rem", width: '100%' }} containerStyle={{padding: 0 , width: "95%"}}>
          <BorderStyleDropdown
            onChange={handleChange}
            borderWidth={formData.borderWidth}
            borderStyle={formData.borderStyle}
            borderColor={formData.borderColor}
            borderRadius={formData.borderRadius}
            containerStyle={{ border: "1px solid #DDDDDD", borderRadius: "10px", padding: "0.5rem" }}
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
