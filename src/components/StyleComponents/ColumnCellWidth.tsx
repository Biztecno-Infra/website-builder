import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CustomInput } from "@components/lib";

interface ColumnCellWidthProps {
  rows: number;
  columns: number;
  cellWidths: number[];
  updateCellWidths: (newWidths: number[]) => void;
}

const ColumnCellWidthContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  width: 95%;
  border: 1px solid #DDDDDD;
  border-radius: 10px;
  padding: 0.5rem;
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

  console.log(columns)

  // const handleWidthChange = (value: number, index: number) => {
  //   let newWidths = [...localWidths];

  //   const adjustedValue = Math.max(
  //     0,
  //     Math.min(100, Math.round(value * 100) / 100)
  //   );
  //   newWidths[index] = adjustedValue;

  //   const totalOtherWidths = 100 - adjustedValue;
  //   const remainingColumns = Number(columns) - 1;

  //   if (remainingColumns > 0) {
  //     const remainingWidths =
  //       Math.round((totalOtherWidths / remainingColumns) * 100) / 100;
  //     newWidths = newWidths.map((w, i) =>
  //       i === index ? adjustedValue : remainingWidths
  //     );
  //   }

  //   setLocalWidths(newWidths);
  //   updateCellWidths(newWidths);
  // };
const handleWidthChange = (value: number, index: number) => {
  if (columns === 1) return;
  const newWidths = [...localWidths];
  const adjustedValue = Math.max(0, Math.min(100, Math.round(value * 100) / 100));
  newWidths[index] = adjustedValue;

  setLocalWidths(newWidths);
  updateCellWidths(newWidths);
};
  return (
    <ColumnCellWidthContainer>
      {localWidths.map((width, index) => (
        <CustomInput
          key={index}
          name={`cell-width-${index}`}
          type="number"
          disabled={columns === 1}
          // label={`Width (Column ${index + 1})`}
          value={width}
          onChange={(name, value) => handleWidthChange(Number(value), index)}
          placeholder="Enter width in percentage"
          unitsLabel="%"
          containerStyle={{ width: "30%", padding: 4, marginBottom: 5, marginRight: 3 }}
          inputStyle={{ width: "60%" }}
        />
      ))}
    </ColumnCellWidthContainer>
  );
};

export default ColumnCellWidthComponent;
