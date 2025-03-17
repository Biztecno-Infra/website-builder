import React, { useState, useEffect } from "react";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { GlobalStyles } from "types";
import { Dropdown, ReactColorPicker } from "@components/lib";
import { fontOptions } from "../constant";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow } from "../style";

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
    padding: initialPadding
  } = globalStyles;

  const [styles, setStyles] = useState({
    canvasColor: initialCanvasColor,
    textColor: initialTextColor,
    fontFamily: initialFontFamily,
    padding: initialPadding
  });

  // Effect to update the state when globalStyles changes
  useEffect(() => {
    setStyles(globalStyles);
  }, [globalStyles]);

  // Common change handler
  const handleChange = (field: string, value: any) => {
    setStyles((prevStyles) => {
      const updatedStyles = { ...prevStyles, [field]: value };
      updateGlobalStyles(updatedStyles);
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
        <FlexRow>
          <ReactColorPicker
            label={"Select Canvas color"}
            onColorChange={(field, value) => handleChange("canvasColor", value)}
            selectedColor={styles.canvasColor}
            containerStyle={{ width: "60%" }}
          />
          <PaddingInput
            padding={styles.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "40%", paddingLeft: "1rem" }}
          />
        </FlexRow>
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
