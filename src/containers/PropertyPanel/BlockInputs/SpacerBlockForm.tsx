import React, { useEffect, useState } from "react";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow, FormWrapper } from "../style";
import { TextArea } from "@components/lib";
import { parseCssString } from "@utils/index";

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    id: blockId,
    backgroundColor,
    padding,
    customCss,
  } = selectedBlock as SpacerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    padding,
    customCss,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      padding,
      customCss,
    });
  }, [selectedBlock]);

 const handleChange = (property: string, value: any) => {
    const updatedValue = property === "customCss" ? parseCssString(value) : value;
  
    setFormData((prevData) => {
      const updatedData = { ...prevData, [property]: value };
      updateBlock(blockId, property, updatedValue);  
      return updatedData;
    });
  };

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Spacer">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label={"Select Background color"}
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "55%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "40%" }}
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
