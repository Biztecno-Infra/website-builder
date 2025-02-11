import { CustomInput } from "@components/CustomInputs";
import React from "react";

// Define types for font size props
interface FontSizeProps {
  fontSize: number;
  onChange: (value: number) => void;
}

export const FontSizeInput: React.FC<FontSizeProps> = ({ fontSize, onChange }) => {
  return (
    <div className="flex flex-column">
      <CustomInput
        id="fontSize"
        name="fontSize"
        label="Font Size"
        placeholder="Enter font size"
        value={fontSize}
        onChange={(name, value) => onChange(parseInt(value, 10))}
        type="number"
      />
    </div>
  );
};
