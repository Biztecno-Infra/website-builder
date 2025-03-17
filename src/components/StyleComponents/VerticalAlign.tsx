import React from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

const Container = styled.div`
  display: flex;
  background: #f5f5f5;
  padding: 6px;
  border-radius: 6px;
  justify-content: space-between;
  width: 100%;
`;

const AlignmentButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "#d3d3d3" : "transparent")};
  border: none;
  padding: 3px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23%;
  &:hover {
    background: #e0e0e0;
  }
  svg {
    font-size: 16px;
    color: ${(props) => (props.$active ? "#000" : "#555")};
  }
`;

interface VerticalAlignment {
  value: string;
  onChange: (field: string, value: string) => void;
  containerStyle?: React.CSSProperties;
}

export const VerticalAlignment: React.FC<VerticalAlignment> = ({ value, onChange, containerStyle }) => {
  return (
    <Container style={containerStyle}>
      <AlignmentButton $active={value === "top"} onClick={() => onChange("verticalAlignment", "top")}>
        <SvgIcon name={CUSTOM_SVG_ICON.TopAligment} size={SizeEnum.Small} />
      </AlignmentButton>
      <AlignmentButton $active={value === "bottom"} onClick={() => onChange("verticalAlignment", "bottom")}>
        <SvgIcon name={CUSTOM_SVG_ICON.BottomAligment} size={SizeEnum.Small} />
      </AlignmentButton>
      <AlignmentButton $active={value === "middle"} onClick={() => onChange("verticalAlignment", "middle")}>
        <SvgIcon name={CUSTOM_SVG_ICON.CenterAligment} size={SizeEnum.Small} />
      </AlignmentButton>
    </Container>
  );
};