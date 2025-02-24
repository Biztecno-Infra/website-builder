import React, { useState } from "react";
import styled from "styled-components";
import GradientColorPicker from "react-best-gradient-color-picker";
import useClickOutside from "hoc/useClickOutside";

interface ColorPickerProps {
  onColorChange: (field: string, value: string) => void;
  label?: string;
  selectedColor: string;
  containerStyle?: React.CSSProperties;
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  background-color: #f1f1f1;
  border-radius: 5px;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:3px;

`;

const ColorBox = styled.div<{ selectedColor: string }>`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 4px;
  background-color: ${({ selectedColor }) => selectedColor || "#000000"};
  cursor: pointer;
  border: 1px solid #ccc;
`;

const ColorHexInput = styled.input`
  font-size: 14px;
  border: none;
  background: #F1F1F1;
  border-radius: 4px;
  width: 90px;
  text-transform: uppercase;
  text-align: left;
  margin-left: 0.5rem;
`;

const GradientPickerContainer = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 10;
  background: white;
  border: 1px solid #ddd;
  padding: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`;

const rgbToHex = (color: string) => {
  if (color.startsWith("rgb")) {
    const rgbValues = color.match(/\d+/g);
    if (rgbValues) {
      return `#${rgbValues
        .slice(0, 3)
        .map((num) => parseInt(num).toString(16).padStart(2, "0"))
        .join("")}`.toUpperCase();
    }
  }
  return color.toUpperCase(); // If already HEX, return as is
};

export const ReactColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  selectedColor,
  containerStyle
}) => {
  const [color, setColor] = useState(selectedColor || "#000000");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useClickOutside(() => setPickerVisible(false));

  const handleColorChange = (newColor: string) => {
    const hexColor = rgbToHex(newColor);
    setColor(hexColor);
    onColorChange("color", hexColor);
  };

  return (
    <ColorPickerContainer style={containerStyle}>
      <PickerRow>

        <ColorBox selectedColor={color} onClick={() => setPickerVisible(!isPickerVisible)} />

        <ColorHexInput
          type="text"
          value={color}
          onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
          maxLength={7}
        />
      </PickerRow>

      {isPickerVisible && (
        <GradientPickerContainer ref={pickerRef}>
          <GradientColorPicker
            value={color}
            onChange={handleColorChange}
            hidePresets
            hideGradientControls
            hideGradientStop
            hideAdvancedSliders
          />
        </GradientPickerContainer>
      )}
    </ColorPickerContainer>
  );
};
