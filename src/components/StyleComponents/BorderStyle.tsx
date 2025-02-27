import React from "react";
import { CustomDropdown } from "@components/CustomInputs";
import { Input } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BorderContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.5rem 0%;
  align-items: center;
  justify-content: space-between;
`;

const borderStyleOptions = [
  { key: "", text: "Border Style", value: "" },
  { key: "solid", text: "Solid", value: "solid" },
  { key: "dashed", text: "Dashed", value: "dashed" },
  { key: "dotted", text: "Dotted", value: "dotted" },
  { key: "double", text: "Double", value: "double" },
  { key: "groove", text: "Groove", value: "groove" },
  { key: "ridge", text: "Ridge", value: "ridge" },
  { key: "inset", text: "Inset", value: "inset" },
  { key: "outset", text: "Outset", value: "outset" },
  { key: "none", text: "None", value: "none" },
  { key: "hidden", text: "Hidden", value: "hidden" },
];

interface BorderStyleDropdownProps {
  onChange: (field: string, value: string) => void;
  borderWidth: any;
  borderStyle: any;
  borderColor: any;
  borderRadius: any;
  containerStyle?: React.CSSProperties;
}

export const BorderStyleDropdown: React.FC<BorderStyleDropdownProps> = ({
  onChange,
  borderWidth,
  borderStyle,
  borderColor,
  borderRadius,
  containerStyle
}) => {
  return (
    <Wrapper style={containerStyle}>
      <CustomDropdown
        id="borderStyle"
        name="borderStyle"
        label="Border Style"
        options={borderStyleOptions}
        placeholder="Select Border Style"
        onChange={(name, value) => onChange("borderStyle", value)}
        initialValue={borderStyle}
      // containerStyle={{ width: '%' }}
      />
      <BorderContainer>
        <ReactColorPicker
          onColorChange={(field, value) => onChange("borderColor", value)}
          label="Select Border Color"
          selectedColor={borderColor || ""}
          containerStyle={{ width: "55%" }}
        />
        <Input
          name="borderRadius"
          type="text"
          label="Border Radius"
          value={borderRadius}
          onChange={(name, value) => onChange("borderRadius", value)}
          iconProps={{
            name: CUSTOM_SVG_ICON.BorderWidth,
          }}
          unitsLabel="px"
          containerStyle={{ width: "40%", paddingRight: "0.5rem" }}
        />
      </BorderContainer>


      <Input
        name="borderWidth"
        type="text"
        label="Border Width"
        value={borderWidth}
        onChange={(name, value) => onChange("borderWidth", value)}
        iconProps={{
          name: CUSTOM_SVG_ICON.BorderRadius,
        }}
        unitsLabel="px"
        containerStyle={{ width: "40%", paddingRight: "0.5rem" }}
      />

    </Wrapper>
  );
};
