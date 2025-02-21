import React from "react";
import { CustomDropdown } from "@components/CustomInputs";
import { Input } from "@components/lib";
import { ReactColorPicker } from "@components/CustomInputs";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
      <Input
        name="borderWidth"
        placeholder="Border Width"
        type="number"
        label="Border Width"
        value={borderWidth}
        onChange={(name, value) => onChange("borderWidth", value)}
      />
      <CustomDropdown
        id="borderStyle"
        name="borderStyle"
        label="Border Style"
        options={borderStyleOptions}
        placeholder="Select Border Style"
        onChange={(name, value) => onChange("borderStyle", value)}
        initialValue={borderStyle}
      />
      <ReactColorPicker
        onColorChange={(field, value) => onChange("borderColor", value)}
        label="Select Border Color"
        selectedColor={borderColor || ""}
      />
      <Input
        name="borderRadius"
        placeholder="Border Radius"
        type="number"
        label="Border Radius"
        value={borderRadius}
        onChange={(name, value) => onChange("borderRadius", value)}
      />
    </Wrapper>
  );
};
