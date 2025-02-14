import React from "react";
import { Padding } from "types";
import styled from "styled-components";
import { Input } from "@components/lib";

interface PaddingProps {
  padding: Padding;
  onChange: (padding: Padding) => void;
  mainLabel?: string;
}

const PaddingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaddingLabel = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

export const PaddingInput: React.FC<PaddingProps> = ({ padding, onChange, mainLabel }) => {
  const handlePaddingChange = (side: string, value: number) => {
    onChange({
      ...padding,
      [side]: value,
    });
  };

  return (
    <PaddingWrapper>
      {mainLabel && <PaddingLabel>Button Padding</PaddingLabel>}
      
      <Input
        name="paddingTop"
        label="Padding Top"
        placeholder="Enter padding top"
        value={padding.top}
        onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingRight"
        label="Padding Right"
        placeholder="Enter padding right"
        value={padding.right}
        onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingBottom"
        label="Padding Bottom"
        placeholder="Enter padding bottom"
        value={padding.bottom}
        onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingLeft"
        label="Padding Left"
        placeholder="Enter padding left"
        value={padding.left}
        onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
    </PaddingWrapper>
  );
};
