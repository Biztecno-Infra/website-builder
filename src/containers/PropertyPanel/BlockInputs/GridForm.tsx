import React, { useState, useEffect } from "react";
import { BlockFormProps } from "../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import { ReactColorPicker } from "@components/CustomInputs";
import ColumnCellWidthComponent from "@components/StyleComponents/ColumnCellWidth";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { GridProps } from "../../../types";
import { Input, TextArea } from "@components/lib";
import { FlexRow, FormWrapper } from "../style";

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
    customCss ,
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
        const newCellWidths = Array.from({ length: value }, () =>
          Math.round(100 / value)
        );
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
    <FormWrapper>
      <BasePropertyWrapper name="Edit Spacer">
        <FlexRow>
          <Input
            name="columns"
            placeholder="Cols"
            unitsLabel="Columns"
            value={formData.columns}
            onChange={handleChange}
            type="number"
            containerStyle={{ width: "45%", padding: 4 }}
            inputStyle={{ width: "30%" }}
          />
          <Input
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
          labelColor={{
            color: "#111111",
            paddingTop: "1rem",
            width: "100%",
            fontSize: "11px",
          }}
          containerStyle={{ padding: 0, border: "none", width: "100%" }}
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
        <BasePropertyWrapper
          name="Border Properties"
          labelColor={{ color: "#111111", paddingTop: "1rem", width: "100%" }}
          containerStyle={{ padding: 0, width: "95%" }}
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
