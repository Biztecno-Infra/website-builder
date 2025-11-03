import React, { useState, useEffect } from "react";
import styled from "styled-components";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { GlobalStyles } from "types";
import { Dropdown, ReactColorPicker, Tooltip } from "@components/lib";
import { fontOptions } from "../constant";
import { PaddingInput } from "@components/StyleComponents";
import { FlexRow } from "../style";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";

interface GlobalStylesFormProps {
  globalStyles: GlobalStyles;
  updateGlobalStyles: (updatedStyles: any) => void;
  brandsList?: any[];
  selectedBrand?: any;
  onBrandSelect: (brands: any[], branding: any) => void;
}

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const BrandRow = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.isSelected ? "#0B978E" : "#EEEEEE")};
  background-color: ${(props) =>
    props.isSelected ? "#0B978E29" : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: space-between;

  &:hover {
    background-color: #f9f9f9;
    border-color: #cccccc;
  }
`;

const BrandName = styled.div`
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ColorSwatches = styled.div`
  display: flex;
  justify-content: space-between;
  width: 70%;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 1.5rem;
  height: 1.5rem;
  background-color: ${(props) => props.color};
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border: 1px solid #333;
  }
`;

const NoBrandsMessage = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
`;

export const RootStylesForm: React.FC<GlobalStylesFormProps> = ({
  globalStyles,
  updateGlobalStyles,
  selectedBrand,
  brandsList = [],
  onBrandSelect,
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
  const getTooltipContent = (colorItem: any) => {
    return `${colorItem.colorName} (${colorItem.hex})`;
  };
  // Handle brand selection
  const handleBrandSelect = (brand: any) => {
    if (onBrandSelect) {
      onBrandSelect(brandsList, brand);
    }
  };
  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Global Text Settings">
        <ReactColorPicker
          label={"Select Text color"}
          onColorChange={(field, value) => handleChange("textColor", value)}
          selectedColor={styles.textColor}
          containerStyle={{ width: "80%", marginBottom: 10 }}
          selectedBrand={selectedBrand}
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
            selectedBrand={selectedBrand}
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
        containerStyle={{ borderTop: "1px solid #EEEEEE", marginTop: "1rem" }}
      >
        <BrandContainer>
          {brandsList.length === 0 ? (
            <NoBrandsMessage>
              No brands available. Please add brands to see them here.
            </NoBrandsMessage>
          ) : (
            brandsList.map((brand) => (
              <BrandRow
                key={brand._id}
                isSelected={selectedBrand?._id === brand._id}
                onClick={() => handleBrandSelect(brand)}
              >
                <Tooltip content={brand.name} style={{ width: "30%"}}>
                  <BrandName>{brand.name}</BrandName>
                </Tooltip>

                <ColorSwatches>
                  {brand.colorPalette?.map((colorItem: any, index: number) => (
                    <Tooltip key={index} content={getTooltipContent(colorItem)}>
                      <ColorSwatch
                        color={colorItem.hex}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering brand selection
                          // You could add functionality to apply individual colors here
                        }}
                      />
                    </Tooltip>
                  ))}
                </ColorSwatches>
              </BrandRow>
            ))
          )}
        </BrandContainer>
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
