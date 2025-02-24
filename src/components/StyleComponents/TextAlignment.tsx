import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  background: #f5f5f5;
  padding: 6px;
  border-radius: 6px;
  justify-content: space-between;
  width: 100%;
`;

const AlignmentButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? "#d3d3d3" : "transparent")};
  border: none;
  padding: 3px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25%;
  
  &:hover {
    background: #e0e0e0;
  }
  
  svg {
    font-size: 16px;
    color: ${(props) => (props.active ? "#000" : "#555")};
  }
`;

interface AlignmentSelectorProps {
  value: string;
  onChange: (field: string, value: string) => void;
  containerStyle?: React.CSSProperties;
}

export const AlignmentSelector: React.FC<AlignmentSelectorProps> = ({ value, onChange, containerStyle }) => {
  return (
    <Container style={containerStyle}>
      <AlignmentButton active={value === "left"} onClick={() => onChange("alignment", "left")}>
        <SvgIcon name={CUSTOM_SVG_ICON.LeftAlign} size={SizeEnum.Small} />
      </AlignmentButton>
      <AlignmentButton active={value === "center"} onClick={() => onChange("alignment", "center")}>
        <SvgIcon name={CUSTOM_SVG_ICON.CenterAlign} size={SizeEnum.Small} />
      </AlignmentButton>
      <AlignmentButton active={value === "right"} onClick={() => onChange("alignment", "right")}>
        <SvgIcon name={CUSTOM_SVG_ICON.RightAlign} size={SizeEnum.Small} />
      </AlignmentButton>
      <AlignmentButton active={value === "justify"} onClick={() => onChange("alignment", "justify")}>
        <SvgIcon name={CUSTOM_SVG_ICON.JustifyAlign} size={SizeEnum.Small} />
      </AlignmentButton>
    </Container>
  );
};