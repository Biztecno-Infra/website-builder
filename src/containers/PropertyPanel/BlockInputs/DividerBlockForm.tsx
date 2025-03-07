import React, { useEffect, useState } from "react";
import { ReactColorPicker } from "@components/CustomInputs";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { DividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { Input, TextArea } from "@components/lib";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexRow, FormWrapper } from "../style";
import { parseCssString } from "@utils/index";


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
    customCss,
    id: blockId,
  } = selectedBlock as DividerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    thickness,
    alignment,
    padding,
    dividerColor,
    customCss
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      thickness,
      alignment,
      padding,
      dividerColor,
      customCss
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
            value={formData.thickness ||''}
            type="number"
            onChange={(name, value) => handleChange("thickness", Number(value))}
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
