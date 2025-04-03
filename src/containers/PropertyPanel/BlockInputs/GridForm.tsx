import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import ColumnCellWidthComponent from "@components/StyleComponents/ColumnCellWidth";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { GridProps } from "../../../types";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { FlexRow, FormWrapper } from "../style";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";

export const GridBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const {
    rows,
    columns,
    columnGap,
    backgroundColor,
    cellWidths,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    backgroundImage, 
    backgroundPosition , 
    backgroundRepeat , 
    backgroundSize,
    id: blockId,
  } = selectedBlock as GridProps;

  const [formData, setFormData] = useState({
    rows,
    columns,
    columnGap,
    backgroundColor,
    backgroundImage, 
    cellWidths,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    backgroundPosition , 
    backgroundRepeat, 
    backgroundSize
  });

  useEffect(() => {
    setFormData({
      rows,
      columns,
      columnGap,
      backgroundColor,
      backgroundImage, 
      cellWidths,
      borderWidth,
      borderStyle,
      borderColor,
      borderRadius,
      customCss,
      backgroundPosition , 
    backgroundRepeat, 
    backgroundSize
    });
  }, [selectedBlock]);

  const handleChange = (property: string, value: any) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [property]: value };

      if (property === "columns") {
        const newCellWidths = Array.from({ length: value }, () =>
          Math.round(100 / value)
        );
        updatedData.cellWidths = newCellWidths;

        updateBlock(blockId, "columns", value);
        updateBlock(blockId, "cellWidths", newCellWidths);
      } else {
        updateBlock(blockId, property, value);
      }

      return updatedData;
    });
  };


  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Columns">
        <FlexRow>
          <CustomInput
            name="columns"
            placeholder="Cols"
            unitsLabel="Columns"
            value={formData.columns}
            onChange={handleChange}
            type="number"
            containerStyle={{ width: "45%", padding: 4 }}
            inputStyle={{ width: "30%" }}
            checkLessThanOne
          />
          <CustomInput
            name="columnGap"
            placeholder="Column Gap"
            type="number"
            unitsLabel="Column Gap"
            value={formData.columnGap}
            onChange={handleChange}
            containerStyle={{ width: "45%", padding: 4 }}
            inputStyle={{ width: "30%" }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Column Width"
          containerStyle={{ padding: 0, border: "none", width: "100%" }}
          subLabel
        >
          <ColumnCellWidthComponent
            rows={formData.rows}
            columns={formData.columns}
            cellWidths={formData.cellWidths}
            updateCellWidths={(newWidths) =>
              handleChange("cellWidths", newWidths)
            }
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>

      <BasePropertyWrapper name="Edit Container">
        <ReactColorPicker
          onColorChange={(field, value) =>
            handleChange("backgroundColor", value)
          }
          selectedColor={formData.backgroundColor}
          containerStyle={{ width: "80%", marginBottom: 10 }}
        />
        {/* <CustomInput
          name="backgroundImage"
          placeholder="Enter Background Image URL"
          value={formData.backgroundImage || ""}
          onChange={handleChange}
          containerStyle={{ width: "90%", padding: 4 }}
          inputStyle={{ width: "100%" }}
        /> */}

        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            padding: 0,
            width: "95%",
            border: "none",
            marginTop: "0.5rem",
          }}
        >
          <BorderStyleDropdown
            onChange={handleChange}
            borderWidth={formData.borderWidth}
            borderStyle={formData.borderStyle}
            borderColor={formData.borderColor}
            borderRadius={formData.borderRadius}
            containerStyle={{
              border: "1px solid #DDDDDD",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          />
        </BasePropertyWrapper>
        <BasePropertyWrapper
          name="Background Properties"
          subLabel
          containerStyle={{
            padding: 0,
            width: "95%",
            border: "none",
            marginTop: "0.5rem",
          }}
        >
          <BackgroundProperties
            onChange={handleChange}
            backgroundImage={formData.backgroundImage || ""}
            backgroundPosition={formData.backgroundPosition || ""}
            backgroundRepeat={formData.backgroundRepeat || ""}
            backgroundSize={formData.backgroundSize || ""}
            containerStyle={{
              border: "1px solid #DDDDDD",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional properties for e.g, font-size: 14px; {key}: {value};"
          value={formData.customCss || ""}
          rows={6}
          onChange={(name: string, value: string) =>
            handleChange("customCss", value)
          }
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
