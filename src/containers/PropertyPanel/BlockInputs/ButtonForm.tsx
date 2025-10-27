import React from "react";
import { BlockFormProps } from "../types";
import { PaddingInput, AlignmentSelector } from "@components/StyleComponents";
import styled, { useTheme } from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { defaultPadding } from "@utils/constant";
import { ButtonProps } from "types";
import {
  CustomInput,
  TextArea,
  Dropdown,
  ReactColorPicker,
} from "@components/lib";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { FlexContainer, FlexRow, FormWrapper } from "../style";
import { fontOptions, fontWeightOptions } from "../constant";
import { useBlockForm } from "../useBlockForm";

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
`;
const WidthHeightContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5rem;
`;
export const ButtonBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const theme = useTheme();
  // Use the optimized form hook
  const { formData, handleChange } = useBlockForm(
    selectedBlock as ButtonProps,
    updateBlock
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper
        name="Edit Button Text"
        containerStyle={{ padding: "1rem" }}
      >
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
        <CustomInput
          name="buttonText"
          placeholder="Enter button text here"
          value={formData.buttonText}
          onChange={(name, value) => handleChange("buttonText", value)}
          containerStyle={{ marginBottom: "0.75rem", width: "95%", padding: 2 }}
        />

        <FlexRow>
          <Dropdown
            name="fontFamily"
            onChange={handleChange}
            options={fontOptions}
            initialValue={formData.fontFamily}
            containerStyle={{ width: "60%" }}
          />

          <CustomInput
            name="fontSize"
            placeholder="Enter font size"
            value={formData.fontSize || ""}
            onChange={(name, value) => handleChange("fontSize", value)}
            type="number"
            containerStyle={{ width: "30%", padding: 3 }}
            inputStyle={{ width: "45%" }}
            unitsLabel="px"
          />
        </FlexRow>
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) => handleChange("color", value)}
            label="Select Text color"
            selectedColor={formData.color || ""}
            containerStyle={{ width: "60%" }}
          />

          <Dropdown
            name="fontWeight"
            options={fontWeightOptions}
            onChange={(name, value) => handleChange("fontWeight", value)}
            initialValue={formData.fontWeight}
            containerStyle={{ width: "26%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>

        {/* <AlignmentSelector
          onChange={handleChange}
          value={formData.alignment}
          containerStyle={{ width: "60%" }}
        /> */}
      </BasePropertyWrapper>
      <BasePropertyWrapper
        name="Edit Button"
        containerStyle={{ padding: "1rem" }}
      >
        <WidthHeightContainer>
          <CustomInput
            type="number"
            name="width"
            placeholder="Enter Button Width"
            value={formData.width || ""}
            onChange={(name, value) => handleChange("width", value)}
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            inputStyle={{ width: "35%" }}
            containerStyle={{
              width: "40%",
              padding: 2,
            }}
          />
          <CustomInput
            type="number"
            name="height"
            placeholder="Enter Button Height"
            value={formData.height || ""}
            onChange={(name, value) => handleChange("height", value)}
            unitsLabel="px"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageHeight,
            }}
            inputStyle={{ width: "35%" }}
            containerStyle={{
              width: "40%",
              marginLeft: "1rem",
              padding: 2,
            }}
          />
        </WidthHeightContainer>
        <CustomInput
          name="navigateToUrl"
          placeholder="Enter Button Navigation URL"
          value={formData.navigateToUrl}
          onChange={(name, value) => handleChange("navigateToUrl", value)}
          containerStyle={{ marginBottom: "0.75rem", width: "90%", padding: 2 }}
        />
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("buttonColor", value)}
          selectedColor={formData.buttonColor || ""}
          containerStyle={{ width: "90%", marginBottom: 10 }}
        />

        <FlexRow>
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
            containerStyle={{ width: "53%", padding: 8 }}
          />
          <PaddingInput
            padding={formData.buttonPadding}
            onChange={(padding) => handleChange("buttonPadding", padding)}
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            border: "none",
            padding: 0,
            width: "95%",
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
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            label="Select Background Color"
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "58%" }}
          />
          <PaddingInput
            padding={formData.padding}
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%", paddingLeft: "0.5rem" }}
          />
        </FlexRow>
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
