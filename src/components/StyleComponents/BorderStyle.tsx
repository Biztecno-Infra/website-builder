import React from "react";
import styled from "styled-components";
import { CustomInput, Dropdown } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
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

export const borderStyleOptions = [
  { key: "", text: "None", value: "" },
  { key: "solid", text: "Solid", value: "solid" },
  { key: "dashed", text: "Dashed", value: "dashed" },
  { key: "dotted", text: "Dotted", value: "dotted" },
  { key: "double", text: "Double", value: "double" }
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
  containerStyle,
}) => {
  return (
    <Wrapper style={containerStyle}>
      <Dropdown
        name="borderStyle"
        options={borderStyleOptions}
        onChange={(name, value) => onChange("borderStyle", value as string)}
        initialValue={borderStyle}
      />
      <BorderContainer>
        <ReactColorPicker
          onColorChange={(field, value) => onChange("borderColor", value)}
          label="Select Border Color"
          selectedColor={borderColor}
          containerStyle={{ width: "55%" }}
        />
        <CustomInput
          name="borderRadius"
          type="number"
          value={borderRadius}
          onChange={(name, value) => onChange("borderRadius", value)}
          iconProps={{
            name: CUSTOM_SVG_ICON.BorderWidth,
          }}
          unitsLabel="px"
          containerStyle={{ width: "40%", paddingRight: "0.5rem" }}
        />
      </BorderContainer>

      <CustomInput
        name="borderWidth"
        type="number"
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
