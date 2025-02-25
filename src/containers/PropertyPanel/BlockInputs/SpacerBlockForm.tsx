import React, { useEffect, useState } from "react";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { SpacerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import styled from "styled-components";

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const SpacerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    id: blockId,
    backgroundColor,
    padding,
  } = selectedBlock as SpacerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    padding,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      padding,
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
    <BasePropertyWrapper name="Edit Spacer" containerStyle={{border: "none"}}>
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
  );
};
