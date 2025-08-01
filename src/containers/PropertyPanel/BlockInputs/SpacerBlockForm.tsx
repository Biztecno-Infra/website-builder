import React, { useEffect, useState } from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow, FormWrapper } from "../style";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    id: blockId,
    backgroundColor,
    padding,
    customCss,
    layerName,
  } = selectedBlock as SpacerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    padding,
    customCss,
    layerName,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      padding,
      customCss,
      layerName,
    });
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [property]: value };
      updateBlock(blockId, property, value);
      return updatedData;
    });
  };

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Spacer">
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
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label={"Select Background color"}
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "53%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
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
