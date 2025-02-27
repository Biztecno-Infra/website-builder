import React, { useState, useEffect } from "react";
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
  position: relative;
  justify-content: space-between;
`;

const ToggleButton = styled.button`
  background: #f1f1f1;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 3px 0px;
`;

const Popup = styled.div`
  position: absolute;
  top: 120%;
  right: 0%;
  background: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0%;
  width: 11rem;
  z-index: 10;
  display: flex;
  justify-content: space-around;
`;

export const PaddingInput: React.FC<PaddingProps> = ({
  padding,
  onChange,
  mainLabel,
  containerStylePopUp,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // This effect ensures paddingAll is updated only when all paddings are the same
  useEffect(() => {
    const { top, right, bottom, left } = padding;
    if (top === right && right === bottom && bottom === left) {
      // If all padding values are the same, set the common padding
      // Only update the common padding if the sides have changed
      if (padding.top !== padding.right || padding.right !== padding.bottom || padding.bottom !== padding.left) {
        onChange({
          top,
          right,
          bottom,
          left,
        });
      }
    }
  }, [padding.top, padding.right, padding.bottom, padding.left, onChange]);

  const handlePaddingChange = (side: string, value: number) => {
    onChange({
      ...padding,
      [side]: value,
    });
  };

  const handlePaddingAllChange = (value: number) => {
    // Update all sides with the common value
    onChange({
      top: value,
      right: value,
      bottom: value,
      left: value,
    });
  };

  const isCommonPadding = padding.top === padding.right && padding.right === padding.bottom && padding.bottom === padding.left;

  return (
    <PaddingWrapper style={containerStylePopUp}>
      {mainLabel && <label>{mainLabel}</label>}

      {/* Common Padding Input */}
      <Input
        name="paddingAll"
        value={isCommonPadding ? padding.top : ""}
        onChange={(name, value) => {
          const newPadding = parseInt(value, 10);
          if (!isNaN(newPadding)) {
            handlePaddingAllChange(newPadding); // Apply the common value to all sides
          }
        }}
        type="text"
        unitsLabel="px"
        containerStyle={{
          borderRadius: "5px",
          alignItems: "center",
          background: "#F1F1F1",
          width: "55%",
          padding: 3,
        }}
      />

      <ToggleButton onClick={() => setIsPopupOpen(!isPopupOpen)}>
        <SvgIcon name={CUSTOM_SVG_ICON.PaddingExpand} size={SizeEnum.Medium} />
      </ToggleButton>

      {isPopupOpen && (
        <Popup>
          {/* Individual padding inputs */}
          <Input
            name="paddingTop"
            value={padding.top}
            onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
            type="number"
            containerStyle={{ borderTop: "1px solid #0B978E", width: "20%" }}
          />
          <Input
            name="paddingLeft"
            value={padding.left}
            onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
            type="number"
            containerStyle={{ borderLeft: "1px solid #0B978E", width: "20%" }}
          />
          <Input
            name="paddingRight"
            value={padding.right}
            onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
            type="number"
            containerStyle={{ borderRight: "1px solid #0B978E", width: "20%" }}
          />
          <Input
            name="paddingBottom"
            value={padding.bottom}
            onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
            type="number"
            containerStyle={{ borderBottom: "1px solid #0B978E", width: "20%" }}
          />
        </Popup>
      )}
    </PaddingWrapper>
  );
};
