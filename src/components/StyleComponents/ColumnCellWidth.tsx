import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Input } from "@components/lib";

interface ColumnCellWidthProps {
  rows: number;
  columns: number;
  cellWidths: number[];
  updateCellWidths: (newWidths: number[]) => void;
}

const ColumnCellWidthContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ColumnCellWidthComponent: React.FC<ColumnCellWidthProps> = ({
  rows,
  columns,
  cellWidths,
  updateCellWidths,
}) => {
  const [localWidths, setLocalWidths] = useState<number[]>([]);

  useEffect(() => {
    setLocalWidths(cellWidths);
  }, [cellWidths]);

  const handleWidthChange = (value: number, index: number) => {
    let newWidths = [...localWidths];

    const adjustedValue = Math.max(
      0,
      Math.min(100, Math.round(value * 100) / 100)
    );
    newWidths[index] = adjustedValue;

    const totalOtherWidths = 100 - adjustedValue;
    const remainingColumns = Number(columns) - 1;

    if (remainingColumns > 0) {
      const remainingWidths =
        Math.round((totalOtherWidths / remainingColumns) * 100) / 100;
      newWidths = newWidths.map((w, i) =>
        i === index ? adjustedValue : remainingWidths
      );
    }

    setLocalWidths(newWidths);
    updateCellWidths(newWidths);
  };

  return (
    <ColumnCellWidthContainer>
      <Label>Column Cell Widths</Label>
      {localWidths.map((width, index) => (
        <Input
          key={index}
          name={`cell-width-${index}`}
          type="number"
          label={`Width (Column ${index + 1})`}
          value={width}
          onChange={(name, value) => handleWidthChange(Number(value), index)}
          placeholder="Enter width in percentage"
        />
      ))}
    </ColumnCellWidthContainer>
  );
};

export default ColumnCellWidthComponent;
