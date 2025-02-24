import React from "react";
import { CustomDropdown } from "@components/CustomInputs";
import { Input } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
import styled from "styled-components";
import { CUSTOM_SVG_ICON } from "@components/SvgIcon";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BorderContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const borderStyleOptions = [
  { key: "", text: "Select", value: "" },
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
}

export const BorderStyleDropdown: React.FC<BorderStyleDropdownProps> = ({
  onChange,
  borderWidth,
  borderStyle,
  borderColor,
  borderRadius,
}) => {
  return (
    <Wrapper>
      <CustomDropdown
        id="borderStyle"
        name="borderStyle"
        label="Border Style"
        options={borderStyleOptions}
        placeholder="Select Border Style"
        onChange={(name, value) => onChange("borderStyle", value)}
        initialValue={borderStyle}
        containerStyle={{ width: '70%' }}
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
            name: CUSTOM_SVG_ICON.LineHeight,
          }}
          unitsLabel="px"
          containerStyle={{ width: "40%" }}
        />
      </BorderContainer>


      <Input
        name="borderWidth"
        type="text"
        label="Border Width"
        value={borderWidth}
        onChange={(name, value) => onChange("borderWidth", value)}
        iconProps={{
          name: CUSTOM_SVG_ICON.LineHeight,
        }}
        unitsLabel="px"
        containerStyle={{ width: "40%" }}
      />

    </Wrapper>
  );
};
