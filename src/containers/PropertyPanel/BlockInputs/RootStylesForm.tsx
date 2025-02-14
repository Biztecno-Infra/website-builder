import React, { useState, useEffect } from "react";
import { FontFamilyDropdown } from "@components/StyleComponents";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { ReactColorPicker } from "@components/CustomInputs";
import { GlobalStyles } from "types";

interface GlobalStylesFormProps {
  globalStyles: GlobalStyles;
  updateGlobalStyles: (updatedStyles: any) => void;
}

export const RootStylesForm: React.FC<GlobalStylesFormProps> = ({
  globalStyles,
  updateGlobalStyles,
}) => {
  // Destructure the initial global styles and set up the state
  const {
    canvasColor: initialCanvasColor = "#FFFFFF",
    textColor: initialTextColor = "#262626",
    fontFamily: initialFontFamily = "MODERN_SANS",
  } = globalStyles;

  const [styles, setStyles] = useState({
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
      <ReactColorPicker
        label={"Select Canvas color"}
        onColorChange={(field, value) => handleChange("canvasColor", value)}
        selectedColor={styles.canvasColor}
      />

      <ReactColorPicker
        label={"Select Text color"}
        onColorChange={(field, value) => handleChange("textColor", value)}
        selectedColor={styles.textColor}
      />

      <FontFamilyDropdown
        onChange={(field, value) => handleChange("fontFamily", value)}
        value={styles.fontFamily}
      />
    </BasePropertyWrapper>
  );
};
