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
  defaultColor?: any;
  selectedBrand?: any; // Add selectedBrand prop
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 4px;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
    font-size: 0.8rem;
    border: none;
    height: 30px;
    line-height: 0.5rem;
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

const BrandPaletteContainer = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
`;

const BrandPaletteHeader = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const BrandPaletteRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
`;

const BrandName = styled.div`
  width: 30%;
  font-size: 11px;
  color: #333;
  font-weight: 500;
`;

const ColorSwatches = styled.div`
  display: flex;
  justify-content: space-between;
  width: 70%;
  gap: 4px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 2rem;
  height: 2rem;
  background-color: ${props => props.color};
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border: 1px solid #333;
  }
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
  selectedBrand, // Destructure selectedBrand
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

  const handleSwatchClick = (hexColor: string) => {
    setColor(hexColor);
    onColorChange("color", hexColor);
    setPickerVisible(false); // Close picker when swatch is clicked
  };

  return (
    <ColorPickerContainer style={containerStyle}>
      <PickerRow>
        {color ? (
          <ColorBox
            $selectedColor={color}
            onClick={() => setPickerVisible(!isPickerVisible)}
          />
        ) : (
          <SvgIcon 
            name={CUSTOM_SVG_ICON.Plus}  
            size={SizeEnum.Small} 
            onClick={() => setPickerVisible(!isPickerVisible)} 
            svgStyle={{
              padding: 3, 
              border: "1px solid", 
              borderRadius: 3, 
              marginLeft: 5
            }}
          />
        )}

        <ColorHexInput
          className="ebr-colorHexInput"
          type="text"
          value={color}
          onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
          maxLength={10}
          placeholder="Select Color"
        />
      </PickerRow>

      {/* Brand Color Palette - Always visible */}
      {selectedBrand?.colorPalette && selectedBrand.colorPalette.length > 0 && (
        <BrandPaletteContainer>
          <BrandPaletteHeader>
            {selectedBrand.name} Colors
          </BrandPaletteHeader>
          <BrandPaletteRow>
            <BrandName>{selectedBrand.name}</BrandName>
            <ColorSwatches>
              {selectedBrand.colorPalette.map((colorItem: any, index: number) => (
                <ColorSwatch
                  key={index}
                  color={colorItem.hex}
                  title={colorItem.colorName}
                  onClick={() => handleSwatchClick(colorItem.hex)}
                />
              ))}
            </ColorSwatches>
          </BrandPaletteRow>
        </BrandPaletteContainer>
      )}

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