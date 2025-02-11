import React, { useState, useCallback, useMemo } from "react";
import GradientColorPicker from "react-best-gradient-color-picker";
import useClickOutside from "hoc/useClickOutside";
import SvgIcon, { CUSTOM_SVG_ICON, SVGType } from "@components/SvgIcon";
import { globalStyle, rgbToHex } from "@utils/constant";
import "./style.scss";

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
    <div className="flex flex-column flex-align-center margin-1 width-100">
      <div className="flex flex-row flex-align-center margin-1 width-100">
        {label && (
          <label className="input-label margin-b-2 margin-r-2">{label}</label>
        )}

        <div
          className="color-box"
          style={{
            backgroundColor: selectedColor || defaultColor,
            textAlign: "center",
            padding: "2px",
          }}
          onClick={handleColorPickerClick}
        >
          {(selectedColor === defaultColor || !selectedColor) && (
            <SvgIcon
              name={CUSTOM_SVG_ICON.Plus}
              svgType={SVGType.CUSTOM}
              size="huge"
            />
          )}
        </div>

        {selectedColor && selectedColor !== defaultColor && (
          <button onClick={handleReset} className="reset-button margin-l-2">
            Reset
          </button>
        )}
      </div>

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
    </div>
  );
};
