import React from "react";
import { GridProps, GridBlockProps } from "../../types";
import GridCell from "./GridCell";

const GridBlock: React.FC<GridBlockProps> = ({ block, isSelected }) => {
  const {
    columnGap,
    columns,
    backgroundColor = "transparent",
    childBlocks,
    customCss,
    ...rest
  } = block as GridProps;
console.log(block)
  const renderCell = (childBlock: string, index: number) => {
    return (
      <GridCell
        key={childBlock}
        blockId={childBlock}
        cellWidth={(block as GridProps)?.cellWidths?.[index] || 100 / columns}
      />
    );
  };

  return (
    <table
      cellSpacing={columnGap || 0}
      style={{
        width: "100%",
        backgroundColor,
        maxWidth: "100%",
        tableLayout: "fixed",
        border: `1px dashed ${
          isSelected && block.parentId ? "#006E75" : "transparent"
        }`,
        ...customCss,
        ...rest
      }}
    >
      <tbody>
        <tr>{childBlocks?.map(renderCell)}</tr>
      </tbody>
    </table>
  );
};

export default GridBlock;
