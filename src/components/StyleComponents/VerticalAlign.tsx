import { Dropdown } from "@components/lib";
import React from "react";

// Define the options for vertical alignment dropdown
const verticalAlignmentOptions = [
  { key: "top", text: "Top", value: "top" },
  { key: "middle", text: "Middle", value: "middle" },
  { key: "bottom", text: "Bottom", value: "bottom" },
];

interface VerticalAlignmentDropdownProps {
  value: any;
  onChange: (field: string, value: string) => void;
}

export const VerticalAlignmentDropdown: React.FC<VerticalAlignmentDropdownProps> = ({
  value,
  onChange,
}) => {
  return (
      <Dropdown
        name="verticalAlignment"
        options={verticalAlignmentOptions}
        onChange={(name, value) => onChange("verticalAlignment", value as string)}
        initialValue={value}
      />
  );
};
