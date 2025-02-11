import { CustomDropdown } from "@components/CustomInputs";
import React from "react";

const alignmentOptions = [
  { key: "left", text: "Left", value: "left" },
  { key: "center", text: "Center", value: "center" },
  { key: "right", text: "Right", value: "right" },
  { key: "justify", text: "Justify", value: "justify" },
];

interface AlignmentDropdownProps {
  onChange: (field: string, value: string) => void;
  value: any;
}

export const AlignmentDropdown: React.FC<AlignmentDropdownProps> = ({
  onChange,
  value
}) => {
  return (
    <CustomDropdown
      id="textAlignment"
      name="alignment"
      label="Alignment"
      options={alignmentOptions}
      placeholder="Select Text Alignment"
      onChange={(name, value) => onChange("alignment", value)}
      initialValue={value}
    />
  );
};
