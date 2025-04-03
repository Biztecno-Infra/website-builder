import React, { useEffect, useState } from "react";
import styled from "styled-components";
import GradientColorPicker from "react-best-gradient-color-picker";
import useClickOutside from "hoc/useClickOutside";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

interface ColorPickerProps {
  onColorChange: (field: string, value: string) => void;
  label?: string;
  selectedColor: string;
  containerStyle?: React.CSSProperties;
  defaultColor?: any
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
      justify-content: center;
  position: relative;
  background-color: #f1f1f1;
  border-radius: 5px;
height: 1.75rem;
padding: 4px;

`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const ColorBox = styled.div<{ $selectedColor: string }>`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 5px;
  background-color: ${({ $selectedColor }) => $selectedColor || "#000000"};
  cursor: pointer;
  border: 1px solid #ccc;
`;

const ColorHexInput = styled.input`
  &.ebr-colorHexInput {
    font-size: 14px;
    border: none;
    height: 100%;
    line-height:0;
    background: #f1f1f1;
    border-radius: 4px;
    width: calc(100% - 2rem);
    text-align: left;
    margin-left: 0.5rem;
  }
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
  return color.toUpperCase();
};

export const ReactColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  selectedColor,
  containerStyle,
  defaultColor,
}) => {
  const [color, setColor] = useState<string>(defaultColor || "");
  const [isPickerVisible, setPickerVisible] = useState<boolean>(false);
  const pickerRef = useClickOutside(() => setPickerVisible(false));

  useEffect(() => {
    if (selectedColor) {
      setColor(selectedColor);
    } else {
      setColor(defaultColor || "");
    }
  }, [selectedColor]);

  const handleColorChange = (newColor: string) => {
    const hexColor = rgbToHex(newColor);
    setColor(hexColor);
    onColorChange("color", hexColor);
  };

  return (
    <ColorPickerContainer style={containerStyle}>
      <PickerRow>
        {color && <ColorBox
          $selectedColor={color}
          onClick={() => setPickerVisible(!isPickerVisible)}
        />}
        {!color && <SvgIcon name={CUSTOM_SVG_ICON.Plus}  size={SizeEnum.Small} onClick={() => setPickerVisible(!isPickerVisible)} svgStyle={{padding: 3 , border: "1px solid" , borderRadius: 5 , marginLeft: 5}}/>}


        <ColorHexInput
          className="ebr-colorHexInput"
          type="text"
          value={color}
          onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
          maxLength={10}
          placeholder="Select Color"
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
            hideOpacity
            height={150}
            width={220}
            hideColorGuide
            hideGradientAngle
            hideEyeDrop
            hideControls
          />
        </GradientPickerContainer>
      )}
    </ColorPickerContainer>
  );
};
