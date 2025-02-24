import React, { useState } from "react";
import styled from "styled-components";
import { Input } from "@components/lib";
import { Padding } from "types";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";

interface PaddingProps {
  padding: Padding;
  onChange: (padding: Padding) => void;
  mainLabel?: string;
  containerStylePopUp?: React.CSSProperties;
}

const PaddingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const ToggleButton = styled.button`
  background: #f1f1f1;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 9px;
`;

const PxBlock = styled.div`
  color: #111111;
  font-size: 11px;
  font-weight: 400;
  padding: 0% 0.25rem 0% 0.5rem;
  border-radius: 5px;
`;

const InputPxBlock = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #f1f1f1;
  align-items: center;
  justify-content : center ;
  padding: 4px;
  border-radius:5px;
  position: relative;
`;

const InputPadding = styled.div`
  width: 50%;
`

const Popup = styled.div`
  position: absolute;
  top: 120%;
  right: 0%;
  background: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding:  0.25rem 0%;
  width: 11rem;
  z-index: 10;
  display: flex;
  justify-content: space-around;
`;

export const PaddingInput: React.FC<PaddingProps> = ({ padding, onChange, mainLabel, containerStylePopUp }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePaddingChange = (side: string, value: number) => {
    onChange({
      ...padding,
      [side]: value,
    });
  };

  return (
    <PaddingWrapper style={containerStylePopUp}>
      {mainLabel && <label>{mainLabel}</label>}

      <InputPxBlock>
        <InputPadding>
          <Input
            name="paddingAll"
            value={padding.top}
            onChange={(name, value) => {
              const newPadding = parseInt(value, 10);
              onChange({ top: newPadding, right: newPadding, bottom: newPadding, left: newPadding });
            }}
            type="text"
          />
        </InputPadding>
        <PxBlock>px</PxBlock>
      </InputPxBlock>

      <ToggleButton onClick={() => setIsPopupOpen(!isPopupOpen)}>
        <SvgIcon name={CUSTOM_SVG_ICON.PaddingExpand} size={SizeEnum.Small} />
      </ToggleButton>

      {isPopupOpen && (

        <Popup>
          <Input
            name="paddingTop"
            value={padding.top}
            onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
            type="text"
            containerStyle={{ borderTop: "1px solid #0B978E", width: "20%" }}
          />
          <Input
            name="paddingLeft"
            value={padding.left}
            onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
            type="text"
            containerStyle={{ borderLeft: "1px solid #0B978E ", width: "20%" }}
          />
          <Input
            name="paddingRight"
            value={padding.right}
            onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
            type="text"
            containerStyle={{ borderRight: "1px solid #0B978E ", width: "20%" }}
          />
          <Input
            name="paddingBottom"
            value={padding.bottom}
            onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
            type="text"
            containerStyle={{ borderBottom: "1px solid #0B978E ", width: "20%" }}
          />
        </Popup>
      )}
    </PaddingWrapper>
  );
};