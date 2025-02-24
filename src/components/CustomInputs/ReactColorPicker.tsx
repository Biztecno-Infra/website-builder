import React, { useState, useCallback, useMemo } from "react";
import GradientColorPicker from "react-best-gradient-color-picker";
import styled from "styled-components";
import useClickOutside from "hoc/useClickOutside";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { rgbToHex } from "@utils/constant";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";

interface ColorPickerProps {
  onColorChange: (field: string, value: string) => void;
  label?: string;
  selectedColor: string;
  defaultColor?: string;
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  margin-right: 1rem; 
`;

const ColorBox = styled.div<{ selectedColor: string }>`
  background-color: ${({ selectedColor }) => selectedColor || "#e0e0e0"};
  text-align: center;
  padding: 2px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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
  width: 100%;
`;

const GradientPickerContainer = styled.div`
  margin-top: 1rem;
`;

export const ReactColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  label,
  selectedColor,
  defaultColor,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useClickOutside(() => setPickerVisible(false));

  const memoizedDefaultColor = useMemo(() => {
    return defaultColor || selectedColor;
  }, [defaultColor, selectedColor]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      const hexColor = rgbToHex(newColor);
      if (hexColor !== selectedColor) {
        onColorChange("color", hexColor);
      }
    },
    [selectedColor, onColorChange]
  );

  const handleReset = useCallback(() => {
    onColorChange("color", memoizedDefaultColor);
    setPickerVisible(false);
  }, [memoizedDefaultColor, onColorChange]);

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

        <ColorBox selectedColor={selectedColor} onClick={handleColorPickerClick}>
          {!selectedColor && (
            <SvgIcon name={CUSTOM_SVG_ICON.Plus} size={SizeEnum.Small} />
          )}
        </ColorBox>

        {/* {selectedColor && (
          <ResetButton onClick={handleReset}>Reset</ResetButton>
        )} */}
      </PickerRow>

      {isPickerVisible && (
        <GradientPickerContainer ref={pickerRef}>
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
        </GradientPickerContainer>
      )}
    </ColorPickerContainer>
  );
};
