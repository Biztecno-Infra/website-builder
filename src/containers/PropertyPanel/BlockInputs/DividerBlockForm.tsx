import React, { useEffect, useState, useCallback } from "react";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BlockFormProps } from "../types";
import { DividerProps } from "../../../types";
import { PaddingInput } from "@components/StyleComponents";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexRow, FormWrapper } from "../style";
import { useBlockForm } from "../useBlockForm";
import { ScreenViews } from "enum";
import { useTheme } from "styled-components";

export const DividerBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  // Use the optimized form hook
  const { formData, handleChange } = useBlockForm(
    selectedBlock as DividerProps,
    updateBlock
  );

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
          <CustomInput
            type="number"
            name="width"
            placeholder="auto"
            value={formData.width || ""}
            onChange={(name: string, value: string) =>
              handleChange("width", value)
            }
            unitsLabel="%"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "48%",
            }}
            inputStyle={{ width: "35%" }}
            isPercentageValidation
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
            containerStyle={{ width: "48%", marginLeft: "1rem" }}
            checkLessThanOne
          />
        </FlexRow>
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("dividerColor", value)}
          label={"Select Divider color"}
          selectedColor={formData.dividerColor || ""}
          containerStyle={{ width: "70%" }}
        />
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
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "43%" }}
          />
        </FlexRow>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Hide Element">
        <SvgIcon
          name={CUSTOM_SVG_ICON.DesktopIcon}
          onClick={() => handleChange("hideOnDesktop", !formData.hideOnDesktop)}
          svgStyle={{
            cursor: "pointer",
            marginRight: "10px",
            padding: "0.5rem",
            borderRadius: "5px",
            color: formData.hideOnDesktop ? theme.colors.primary : "#DDDDDD",
          }}
          bgColor={formData.hideOnDesktop ? "#CCE2E3" : ""}
        />
        <SvgIcon
          name={CUSTOM_SVG_ICON.MobileIcon}
          onClick={() => handleChange("hideOnMobile", !formData.hideOnMobile)}
          svgStyle={{
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "5px",
            color: formData.hideOnMobile ? theme.colors.primary : "#DDDDDD",
          }}
          bgColor={formData.hideOnMobile ? "#CCE2E3" : ""}
        />
      </BasePropertyWrapper>

      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={formData.customCss || ""}
          rows={6}
          onChange={(name, value) => handleChange("customCss", value)}
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
