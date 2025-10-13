import React from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow, FormWrapper } from "../style";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { useBlockForm } from "../useBlockForm";

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  // Use the optimized form hook
  const { formData, handleChange } = useBlockForm(selectedBlock as SpacerProps, updateBlock);

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
