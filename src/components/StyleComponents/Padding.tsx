import React from "react";

import { CustomInput } from "../CustomInputs";
import { Padding } from "types";

interface PaddingProps {
  padding: Padding;
  onChange: (padding: Padding) => void;
  mainLabel?: string;
}

export const PaddingInput: React.FC<PaddingProps> = ({ padding, onChange , mainLabel }) => {
  const handlePaddingChange = (side: string, value: number) => {
    onChange({
      ...padding,
      [side]: value,
    });
  };

  return (
    <div className="flex flex-column ">
      {mainLabel && <label className="input-label padding-b-2">Button Padding</label>}
      <CustomInput
        id="paddingTop"
        name="paddingTop"
        label="Padding Top"
        placeholder="Enter padding top"
        value={padding.top}
        onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
        type="number"
        baseClassName="margin-b-2"
      />
      <CustomInput
        id="paddingRight"
        name="paddingRight"
        label="Padding Right"
        placeholder="Enter padding right"
        value={padding.right}
        onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
        type="number"
        baseClassName="margin-b-2"
      />
      <CustomInput
        id="paddingBottom"
        name="paddingBottom"
        label="Padding Bottom"
        placeholder="Enter padding bottom"
        value={padding.bottom}
        onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
        type="number"
        baseClassName="margin-b-2"
      />
      <CustomInput
        id="paddingLeft"
        name="paddingLeft"
        label="Padding Left"
        placeholder="Enter padding left"
        value={padding.left}
        onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
        type="number"
        baseClassName="margin-b-2"
      />
    </div>
  );
};

