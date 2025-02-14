import { Input } from "@components/lib";
import React from "react";
import styled from "styled-components";

// Define types for font size props
interface FontSizeProps {
  fontSize: number;
  onChange: (value: number) => void;
}

// Styled container
const FontSizeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FontSizeInput: React.FC<FontSizeProps> = ({ fontSize, onChange }) => {
  return (
    <FontSizeContainer>
      <Input
        name="fontSize"
        label="Font Size"
        placeholder="Enter font size"
        value={fontSize}
        onChange={(name, value) => onChange(parseInt(value as any, 10))}
        type="number"
      />
    </FontSizeContainer>
  );
};
