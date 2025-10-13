import React, { useCallback } from "react";
import { BlockFormProps } from "../types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import ColumnCellWidthComponent from "@components/StyleComponents/ColumnCellWidth";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { GridProps } from "../../../types";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { FlexRow, FormWrapper } from "../style";
import { BackgroundProperties } from "@components/StyleComponents/BackgroundStyle";
import { extractBackgroundUrl } from "@utils/common";
import { useBlockForm } from "../useBlockForm";

export const GridBlockForm: React.FC<BlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  // Use the optimized form hook
  const { formData, handleChange, handleBatchChange } = useBlockForm(selectedBlock as GridProps, updateBlock);

  // Special handler for columns that also updates cellWidths
  const handleColumnsChange = useCallback((name: string, value: string) => {
    const newColumns = parseInt(value) || 1;
    const newCellWidths = Array.from({ length: newColumns }, () =>
      Math.round(100 / newColumns)
    );
    
    // Use batch change for related properties
    handleBatchChange({
      columns: newColumns,
      cellWidths: newCellWidths
    });
  }, [handleBatchChange]);

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Columns">
        <CustomInput
          name="layerName"
          placeholder="Enter Layer Name"
          value={formData.layerName || ""}
          onChange={(name, value) => handleChange("layerName", value)}
          containerStyle={{
            width: "100%",
            marginBottom: "10px",
          }}
        />
        <FlexRow>
          <CustomInput
            name="columns"
            placeholder="Cols"
            unitsLabel="Columns"
            value={formData.columns}
            onChange={handleColumnsChange}
            type="number"
            containerStyle={{ width: "47%", padding: 4 }}
            inputStyle={{ width: "30%" }}
            checkLessThanOne
          />
          <CustomInput
            name="columnGap"
            placeholder="Column Gap"
            type="number"
            unitsLabel="Column Gap"
            value={formData.columnGap}
            onChange={(name, value) => handleChange("columnGap", value)}
            containerStyle={{ width: "47%", padding: 4 }}
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
            updateCellWidths={(newWidths) => handleChange("cellWidths", newWidths)}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>

      <BasePropertyWrapper name="Edit Container">
        <ReactColorPicker
          onColorChange={(field, value) => handleChange("backgroundColor", value)}
          selectedColor={formData.backgroundColor}
          containerStyle={{ width: "80%", marginBottom: 10 }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={formData.responsive}
            onChange={(e) => handleChange("responsive", e.target.checked)}
          />
          Make grid responsive
        </label>
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
            backgroundImage={extractBackgroundUrl(
              formData.backgroundImage || ""
            )}
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
          onChange={(name, value) => handleChange("customCss", value)}
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
