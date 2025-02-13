import React, { useState, useCallback, useMemo } from "react";
import GradientColorPicker from "react-best-gradient-color-picker";
import useClickOutside from "hoc/useClickOutside";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { globalStyle, rgbToHex } from "@utils/constant";
import styled from "styled-components";

interface ColorPickerProps {
  onColorChange: (
    field: "text" | "color",
    value: string,
    type?: string
  ) => void;
  label: string;
  type: string;
  selectedColor: string;
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  margin-right: 1rem;
`;

const ColorBox = styled.div<{ selectedColor: string }>`
  background-color: ${({ selectedColor }) => selectedColor};
  text-align: center;
  padding: 2px;
  cursor: pointer;
  width: 40px;
  height: 40px;
`;

const ResetButton = styled.button`
  margin-left: 1rem;
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 0.875rem;
  color: #007bff;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const PickerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 1rem 0;
  width: 100%;
`;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  label,
  type,
  selectedColor,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useClickOutside(() => setPickerVisible(false));

  const defaultColor = useMemo(() => {
    switch (label) {
      case "Select Text color":
        return globalStyle.textColor;
      case "Select Backdrop color":
        return globalStyle.backdropColor;
      case "Select Canvas color":
        return globalStyle.canvasColor;
      default:
        return globalStyle.initialBgColor;
    }
  }, [label]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      const hexColor = rgbToHex(newColor);
      if (hexColor !== selectedColor) {
        onColorChange("color", hexColor, type);
      }
    },
    [selectedColor, onColorChange, type]
  );

  const handleReset = () => {
    onColorChange("color", defaultColor, type);
    setPickerVisible(false);
  };

  const handleColorPickerClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setPickerVisible(true);
  };

  return (
    <ColorPickerContainer>
      <PickerRow>
        {label && <Label>{label}</Label>}

        <ColorBox
          selectedColor={selectedColor || defaultColor}
          onClick={handleColorPickerClick}
        >
          {(selectedColor === defaultColor || !selectedColor) && (
            <SvgIcon name={CUSTOM_SVG_ICON.Plus} size="huge" />
          )}
        </ColorBox>

        {selectedColor && selectedColor !== defaultColor && (
          <ResetButton onClick={handleReset}>Reset</ResetButton>
        )}
      </PickerRow>

      {isPickerVisible && (
        <div ref={pickerRef}>
          <GradientColorPicker
            value={selectedColor}
            onChange={handleColorChange}
            height={150}
            width={220}
            hideColorGuide
            hideAdvancedSliders
            hideGradientStop
            hideGradientControls
            hidePresets
            hideGradientAngle
            hideEyeDrop
            hideControls
          />
        </div>
      )}
    </ColorPickerContainer>
  );
};
