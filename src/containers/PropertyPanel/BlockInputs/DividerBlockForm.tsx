import React, { useEffect, useState } from "react";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { DividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { Input } from "@components/lib";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const DividerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    backgroundColor,
    thickness = 2,
    alignment = "center",
    padding,
    dividerColor,
    id: blockId,
  } = selectedBlock as DividerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    thickness,
    alignment,
    padding,
    dividerColor,
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      thickness,
      alignment,
      padding,
      dividerColor,
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
      <BasePropertyWrapper name="Edit Divider">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("dividerColor", value)
            }
            label={"Select Divider color"}
            selectedColor={formData.dividerColor || ""}
            containerStyle={{width: "55%"}}
          />
          <Input
            name="thickness"
            placeholder="Enter Divider Thickness"
            value={formData.thickness}
            type="number"
            onChange={(name, value) => handleChange("thickness", value)}
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight
            }}
            unitsLabel="px"
            containerStyle={{width: "40%"}}
          />
        </FlexRow>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label={"Select Background color"}
            selectedColor={formData.backgroundColor}
            containerStyle={{width: "55%"}}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{width: "40%"}}
          />
        </FlexRow>
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
