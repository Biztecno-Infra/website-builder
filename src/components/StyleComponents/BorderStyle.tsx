import { CustomDropdown } from "@components/CustomInputs";
import React from "react";

const borderStyleOptions = [
  {key: "" , text: "Select" , value: ""},
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
  value: string;
}

export const BorderStyleDropdown: React.FC<BorderStyleDropdownProps> = ({
  onChange,
  value,
}) => {
  return (
    <CustomDropdown
      id="borderStyle"
      name="borderStyle"
      label="Border Style"
      options={borderStyleOptions}
      placeholder="Select Border Style"
      onChange={(name, value) => onChange("borderStyle", value)}
      initialValue={value}
    />
  );
};
