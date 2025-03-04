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
`;
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
    customCss,
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

  // useEffect(() => {
  //   const loadImageDimensions = async () => {
  //     if (imageUrl) {
  //       try {
  //         const image = await Jimp.read(imageUrl);
  //         const { width, height } = image.bitmap;
  //         setFormData((prev) => {
  //           const updatedFormData = {
  //             ...prev,
  //             width,
  //             height,
  //           };
  //           updateBlock(selectedBlock.id, "width", width);
  //           updateBlock(selectedBlock.id, "height", height);
  //           return updatedFormData;
  //         });
  //       } catch (error) {
  //         console.error("Error loading image:", error);
  //         // Reset width and height in case of an error
  //       setFormData((prev) => {
  //         const updatedFormData = {
  //           ...prev,
  //           width : 0,
  //           height: 0,
  //         };
  //         return updatedFormData
  //       });
  //       }
  //     }
  //   };
  //   loadImageDimensions();
  // }, []); 

  const handleImageUrlChange = async (value: string) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev, imageUrl: value };
      updateBlock(selectedBlock.id, "imageUrl", value);
      return updatedFormData;
    });

    try {
      const image = await Jimp.read(value);
      const { width, height } = image.bitmap;
console.log(width , height , "ImageForm")
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
          containerStyle={{ marginBottom: "0.75rem" }}
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
            type="number"
            name="height"
            value={formData.height || ""}
            onChange={(name: string, value: string) =>
              handleChange("height", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            containerStyle={{
              paddingRight: "0.5rem",
              width: "45%" 
            }}
            inputStyle={{width: "35%"}}
          />
          <Input
            type="number"
            name="width"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "45%",
              marginLeft: "1rem",
              paddingRight: "0.5rem"
            }}
            inputStyle={{width: "35%"}}
          />
        </WidthHeightContainer>
        <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "60%" }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <PaddingContainer>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "50%" }}
          />

          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "40%", paddingLeft: "1rem" }}
          />
        </PaddingContainer>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{ border: "none", padding: 0, width: "95%" }}
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
