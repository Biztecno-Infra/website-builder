import React, { useState, useEffect } from "react";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { GlobalStyles } from "types";
import { Dropdown, ReactColorPicker } from "@components/lib";
import { fontOptions } from "../constant";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow } from "../style";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";

interface GlobalStylesFormProps {
  globalStyles: GlobalStyles;
  updateGlobalStyles: (updatedStyles: any) => void;
  brandsList?: any[];
  selectedBrand?: any;
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
    padding: initialPadding,
    borderColor: initialBorderColor = "",
    borderWidth: initialBorderWidth = 0,
    borderRadius: initialBorderRadius = 0,
    borderStyle: initialBorderStyle = "none",
  } = globalStyles;

  const [styles, setStyles] = useState({
    canvasColor: initialCanvasColor,
    textColor: initialTextColor,
    fontFamily: initialFontFamily,
    padding: initialPadding,
    borderColor: initialBorderColor,
    borderWidth: initialBorderWidth,
    borderRadius: initialBorderRadius,
    borderStyle: initialBorderStyle,
  });

  // Effect to update the state when globalStyles changes
  useEffect(() => {
    setStyles(globalStyles as any);
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
            containerStyle={{ width: "53%" }}
          />
          <PaddingInput
            padding={styles?.padding}
            onChange={(padding: any) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%", paddingLeft: "1rem" }}
          />
        </FlexRow>
      </BasePropertyWrapper>

      <BasePropertyWrapper
        name="Border Properties"
        subLabel
        containerStyle={{
          border: "none",
          padding: 0,
          width: "95%",
          marginTop: "0.5rem",
          marginLeft: "0.5rem",
        }}
      >
        <BorderStyleDropdown
          onChange={handleChange}
          borderWidth={styles.borderWidth}
          borderStyle={styles.borderStyle}
          borderColor={styles.borderColor}
          borderRadius={styles.borderRadius}
          containerStyle={{
            border: "1px solid #DDDDDD",
            borderRadius: "10px",
            padding: "0.5rem",
          }}
        />
      </BasePropertyWrapper>
      <BasePropertyWrapper
        name="Choose Branding"
        containerStyle={{borderTop: "1px solid #EEEEEE" , marginTop: "1rem"}}
      >
        <div style={{ display: "flex" , width: "100%"}}>
          <div style={{width: "30%"}}>Name</div>
          <div style={{ display: "flex" , justifyContent:"space-between" , width: "70%"}}>
          <div style={{backgroundColor: "#000000" , width: "2rem" , height: "2rem"}} />
          <div style={{backgroundColor: "#000000" , width: "2rem" , height: "2rem"}} />
          <div style={{backgroundColor: "#000000" , width: "2rem" , height: "2rem"}} />
          <div style={{backgroundColor: "#000000" , width: "2rem" , height: "2rem"}} />
          <div style={{backgroundColor: "#000000" , width: "2rem" , height: "2rem"}} />
          </div>
        </div>
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
