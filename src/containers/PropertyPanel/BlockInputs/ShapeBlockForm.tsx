import React, { useCallback } from "react";
import {
  CustomInput,
  Dropdown,
  ReactColorPicker,
  TextArea,
} from "@components/lib";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import {
  AlignmentSelector,
  PaddingInput,
  VerticalAlignment,
} from "@components/StyleComponents";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { FormWrapper, FlexRow, FlexContainer } from "../style";
import styled, { useTheme } from "styled-components";
import { ShapeProps } from "types";
import { BlockFormProps } from "../types";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockForm } from "../useBlockForm";
import RichTextEditor from "./RichTextEditor";

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
`;

const shapeOptions = [
  { text: "Rectangle", value: "rectangle", key: "rectangle" },
  { text: "Rounded Rectangle", value: "rounded", key: "rounded" },
  { text: "Circle", value: "circle", key: "circle" },
  { text: "Oval", value: "oval", key: "oval" },
];

export const ShapeBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  const { formData, handleChange, handleImmediateChange } = useBlockForm(
    selectedBlock as ShapeProps,
    updateBlock
  );

  // Special handler for shape changes that affect dimensions
  const handleShapeChange = useCallback(
    (name: string, value: string | number) => {
      const shapeValue = typeof value === "string" ? value : String(value);
      handleChange("shape", shapeValue);

      // Reset or recalc dimensions when shape changes
      if (shapeValue === "circle") {
        const width = formData.width || 100;
        handleImmediateChange("height", width);
      } else if (shapeValue === "oval") {
        const width = formData.width || 100;
        handleImmediateChange("height", Math.floor(width / 2));
      } else {
        // For rectangle/rounded, restore normal manual editing
        handleImmediateChange("height", 200);
      }
    },
    [handleChange, handleImmediateChange, formData.width, formData.height]
  );

  // Special handler for width changes that affect height for circle/oval
  const handleWidthChange = useCallback(
    (name: string, value: string) => {
      if (value === "") {
        handleChange("width", "");
        return;
      }

      const num = Math.max(1, Number(value) || 0);
      handleChange("width", num);

      // Auto-sync height for circle and oval
      if (formData.shape === "circle") {
        handleImmediateChange("height", num);
      } else if (formData.shape === "oval") {
        handleImmediateChange("height", Math.floor(num / 2));
      }
    },
    [handleChange, handleImmediateChange, formData.shape]
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Shape">
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
        <Dropdown
          name="shape"
          options={shapeOptions}
          onChange={handleShapeChange}
          containerStyle={{ width: "100%", marginBottom: "1rem" }}
          initialValue={formData.shape}
        />
        <CustomInput
          name="imageUrl"
          placeholder="Enter Image URL"
          value={formData.imageUrl || ""}
          onChange={(name, value) => handleChange("imageUrl", value)}
          containerStyle={{ marginBottom: "1rem" }}
        />

        <FlexRow>
          <CustomInput
            name="width"
            placeholder="Width (px)"
            value={formData.width || ""}
            type="number"
            onChange={handleWidthChange}
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            inputStyle={{ width: "40%" }}
            containerStyle={{
              width: "45%",
              padding: 2,
            }}
          />
          <CustomInput
            name="height"
            placeholder="Height (px)"
            value={formData.height !== undefined ? formData.height : ""}
            onChange={(name, value) => {
              if (value === "") {
                handleChange("height", "");
                return;
              }
              const num = Math.max(1, Number(value) || 0);
              handleChange("height", num);
            }}
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            inputStyle={{ width: "40%" }}
            containerStyle={{
              width: "45%",
              padding: 2,
            }}
            type="number"
            disabled={formData.shape === "circle" || formData.shape === "oval"}
          />
        </FlexRow>
        <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "100%", marginBottom: "0.75rem" }}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("shapeColor", value)}
          selectedColor={formData.shapeColor || ""}
          containerStyle={{ width: "100%", marginBottom: 10 }}
        />
        <BasePropertyWrapper
          name="Text Properties"
          subLabel
          containerStyle={{
            padding: 0,
            width: "95%",
            border: "none",
            marginTop: "0.5rem",
          }}
        >
          <RichTextEditor
            handleChange={handleChange}
            textContent={formData.text || ""}
          />
          <FlexRow style={{ marginTop: "0.5rem", alignItems: "center" }}>
            <ReactColorPicker
              onColorChange={(field, value) => handleChange("color", value)}
              selectedColor={formData.color || ""}
              containerStyle={{ width: "65%" }}
            />
            <CustomInput
              name="fontSize"
              placeholder="Enter font size"
              value={formData.fontSize}
              onChange={(name, value) => handleChange("fontSize", value)}
              containerStyle={{
                width: "30%",
              }}
              inputStyle={{ width: "40%" }}
              unitsLabel="px"
              type="number"
            />
          </FlexRow>
          <FlexRow>
            <AlignmentSelector
              name="textAlign"
              onChange={handleChange}
              value={formData.textAlign}
              containerStyle={{ width: "50%", marginRight: "1rem" }}
            />
            <VerticalAlignment
              value={formData.verticalAlign}
              onChange={handleChange}
              containerStyle={{ width: "50%" }}
            />
          </FlexRow>
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <Divider />
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "53%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            padding: 0,
            width: "95%",
            border: "none",
            marginTop: "0.5rem",
          }}
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
            // showBorderRadius={formData.shape !== "circle" && formData.shape !== "oval"} // Hide for circle and oval`
            showBorderRadius={false}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>

      <BasePropertyWrapper name="Hide Element">
        <FlexContainer>
          <SvgIcon
            name={CUSTOM_SVG_ICON.DesktopIcon}
            onClick={() =>
              handleChange("hideOnDesktop", !formData.hideOnDesktop)
            }
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRight: " 1px solid #DDDDDD",
              width: "50%",
              color: formData.hideOnDesktop ? theme.colors.primary : "#DDDDDD",
            }}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.MobileIcon}
            onClick={() => handleChange("hideOnMobile", !formData.hideOnMobile)}
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              width: "50%",
              color: formData.hideOnMobile ? theme.colors.primary : "#DDDDDD",
            }}
          />
        </FlexContainer>
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
export default React.memo(ShapeBlockForm);
