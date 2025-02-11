import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { ColorPicker, CustomInput } from "@components/CustomInputs";
import ColumnCellWidthComponent from "@components/StyleComponents/ColumnCellWidth";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { GridProps } from "../../../types";

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
    customCss = {},
  } = selectedBlock as GridProps;

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    setFormData({
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
    });
  }, [selectedBlock]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [field]: value };

      if (field === "columns") {
        const newCellWidths = Array.from({ length: value }, () => Math.round(100 / value));
        updatedData.cellWidths = newCellWidths;  

        updateBlock(selectedBlock.id, "columns", value);
        updateBlock(selectedBlock.id, "cellWidths", newCellWidths);
      } else {
        updateBlock(selectedBlock.id, field, value);
      }

      return updatedData; 
    });
  };
  
  const addCustomCSS = (property: string, value: string) => {
    const updatedCustomCss = { ...formData.customCss, [property]: value };
    setFormData((prevData) => ({ ...prevData, customCss: updatedCustomCss }));
    updateBlock(selectedBlock.id, "customCss", updatedCustomCss);
  };

  return (
    <BasePropertyWrapper name="Grid Block">
      <ColorPicker
        type="bgColor"
        onColorChange={(field, value) => handleChange("backgroundColor", value)}
        label="Select background color"
        selectedColor={formData.backgroundColor}
      />
      <CustomInput
        id="columns"
        name="columns"
        placeholder="Cols"
        label="Columns"
        value={formData.columns}
        onChange={handleChange}
        type="number"
      />
      <CustomInput
        id="columnGap"
        name="columnGap"
        placeholder="Column Gap"
        type="number"
        label="Column Gap"
        value={formData.columnGap}
        onChange={handleChange}
      />
      <ColumnCellWidthComponent
        rows={formData.rows}
        columns={formData.columns}
        cellWidths={formData.cellWidths}
        updateCellWidths={(newWidths) => handleChange("cellWidths", newWidths)}
      />
      <CustomInput
        id="borderWidth"
        name="borderWidth"
        placeholder="Table Border Width"
        type="number"
        label="Border Width"
        value={formData.borderWidth}
        onChange={handleChange}
      />
      <BorderStyleDropdown value={formData.borderStyle || ""} onChange={handleChange} />
      <ColorPicker
        type="borderColor"
        onColorChange={(field, value) => handleChange("borderColor", value)}
        label="Select Border Color"
        selectedColor={formData.borderColor || ""}
      />
      <CustomInput
        id="borderRadius"
        name="borderRadius"
        placeholder="Border Radius"
        type="number"
        label="Border Radius"
        value={formData.borderRadius}
        onChange={handleChange}
      />
      {/* <CustomCSSInput label="Additional CSS" onAddProperty={addCustomCSS} /> */}
    </BasePropertyWrapper>
  );
};
