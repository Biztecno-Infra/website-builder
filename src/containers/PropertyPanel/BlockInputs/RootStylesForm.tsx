import React, { useState, useEffect } from "react";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { ReactColorPicker } from "@components/CustomInputs";
import { GlobalStyles } from "types";
import { Dropdown } from "@components/lib";
import { fontOptions } from "../constant";

interface GlobalStylesFormProps {
  globalStyles: GlobalStyles;
  updateGlobalStyles: (updatedStyles: any) => void;
}

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RootStylesForm: React.FC<GlobalStylesFormProps> = ({
  globalStyles,
  updateGlobalStyles,
}) => {
  // Destructure the initial global styles and set up the state
  const {
    canvasColor: initialCanvasColor,
    textColor: initialTextColor,
    fontFamily: initialFontFamily,
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
    <FormWrapper>
      <BasePropertyWrapper name="Edit Global Text Settings">
        <ReactColorPicker
          label={"Select Text color"}
          onColorChange={(field, value) => handleChange("textColor", value)}
          selectedColor={styles.textColor}
          containerStyle={{ width: "80%", marginBottom: 10 }}
        />
        <Dropdown
          name="fontFamily"
          onChange={handleChange}
          options={fontOptions}
          initialValue={styles.fontFamily}
          containerStyle={{ width: "80%", marginBottom: 10 }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Edit Background">
        <ReactColorPicker
          label={"Select Canvas color"}
          onColorChange={(field, value) => handleChange("canvasColor", value)}
          selectedColor={styles.canvasColor}
          containerStyle={{ width: "80%" }}
          // defaultColor={globalStyles.canvasColor}
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
