import React, { useEffect, useState } from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { DividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexRow, FormWrapper } from "../style";


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
    layerName
  } = selectedBlock as DividerProps;

  const [formData, setFormData] = useState({
    backgroundColor,
    thickness,
    alignment,
    padding,
    dividerColor,
    customCss , 
    layerName
  });

  useEffect(() => {
    setFormData({
      backgroundColor,
      thickness,
      alignment,
      padding,
      dividerColor,
      customCss, 
      layerName
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
      <BasePropertyWrapper name="Edit Divider">
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
              handleChange("dividerColor", value)
            }
            label={"Select Divider color"}
            selectedColor={formData.dividerColor || ""}
            containerStyle={{ width: "55%" }}
          />
          <CustomInput
            name="thickness"
            placeholder="Enter Divider Thickness"
            value={formData.thickness}
            type="number"
            onChange={(name, value) => handleChange("thickness", Number(value))}
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            unitsLabel="px"
            containerStyle={{ width: "40%" }}
            checkLessThanOne
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
            containerStyle={{ width: "55%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "43%" }}
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
