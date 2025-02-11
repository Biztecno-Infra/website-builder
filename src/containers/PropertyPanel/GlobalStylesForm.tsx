import React, { useState, useEffect } from "react";
import { FontFamilyDropdown } from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { ColorPicker } from "@components/CustomInputs";

interface GlobalStylesFormProps {
  globalStyles: {
    backdropColor: string;
    canvasColor: string;
    textColor: string;
    fontFamily: string;
  };
  updateGlobalStyles: (updatedStyles: any) => void; // Function to update global styles
}

export const GlobalStylesForm: React.FC<GlobalStylesFormProps> = ({
  globalStyles,
  updateGlobalStyles,
}) => {
  // Destructure the initial global styles and set up the state
  const {
    backdropColor: initialBackdropColor = "#F5F5F5",
    canvasColor: initialCanvasColor = "#FFFFFF",
    textColor: initialTextColor = "#262626",
    fontFamily: initialFontFamily = "MODERN_SANS",
  } = globalStyles;

  const [styles, setStyles] = useState({
    backdropColor: initialBackdropColor,
    canvasColor: initialCanvasColor,
    textColor: initialTextColor,
    fontFamily: initialFontFamily,
  });

  // Effect to update the state when globalStyles changes
  useEffect(() => {
    setStyles(globalStyles);
  }, [globalStyles]);

  // Common change handler
  const handleChange = (field: string, value: any) => {
    setStyles((prevStyles) => {
      const updatedStyles = { ...prevStyles, [field]: value };
      updateGlobalStyles(updatedStyles); // Update the global styles
      return updatedStyles;
    });
  };

  return (
    <BasePropertyWrapper name="Global Styles">
      <ColorPicker
        type={"backdropColor"}
        label={"Select Backdrop color"}
        onColorChange={(field, value) => handleChange("backdropColor", value)}
        selectedColor={globalStyles.backdropColor}
      />

      <ColorPicker
        type={"canvasColor"}
        label={"Select Canvas color"}
        onColorChange={(field, value) => handleChange("canvasColor", value)}
        selectedColor={globalStyles.canvasColor}
      />

      <ColorPicker
        type={"textColor"}
        label={"Select Text color"}
        onColorChange={(field, value) => handleChange("textColor", value)}
        selectedColor={globalStyles.textColor}
      />

      <FontFamilyDropdown
        onChange={(field, value) => handleChange("fontFamily", value)}
        value={globalStyles.fontFamily}
      />
    </BasePropertyWrapper>
  );
};
