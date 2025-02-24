import { Input } from "@components/lib";
import React from "react";
import styled from "styled-components";

// Define types for font size props
interface FontSizeProps {
  fontSize: number;
  onChange: (value: number) => void;
  style?: React.CSSProperties;
}

// Styled container
const FontSizeContainer = styled.div`
  display: flex;
  flex-direction: row;
    background-color: #F1F1F1;
    justify-content: space-between;
    align-items: center;

    border-radius: 5px;
`;

export const FontSizeInput: React.FC<FontSizeProps> = ({ fontSize, onChange , style }) => {
  return (
    <FontSizeContainer style={style}>
      <Input
        name="fontSize"
        placeholder="Enter font size"
        value={fontSize}
        onChange={(name, value) => onChange(parseInt(value as any, 10))}
        // type="number"
        containerStyle={{width:"50%" ,     padding: 3 , borderRadius:"inherit" }}
        unitsLabel="px"
      />
      <div style={{width:"50%" , marginLeft: "5px"}}>px</div>
    </FontSizeContainer>
  );
};
