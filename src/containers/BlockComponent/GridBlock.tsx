import React, { useMemo } from "react";
import { GridProps, GridBlockProps } from "../../types";
import GridCell from "./GridCell";
import { parseCssString } from "@utils/index";

const GridBlock: React.FC<GridBlockProps> = ({ block, isSelected }) => {
  const {
    columnGap,
    columns,
    backgroundColor = "transparent",
    childBlocks,
    customCss,
  } = block as GridProps;

  const renderCell = (childBlock: string, index: number) => {
    return (
      <GridCell
        key={childBlock}
        blockId={childBlock}
        cellWidth={(block as GridProps)?.cellWidths?.[index] || 100 / columns}
      />
    );
  };

  const customStyles = useMemo(
    () => parseCssString(customCss || ""),
    [customCss]
  );

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
        borderRadius: 10,
        ...customStyles,
      }}
    >
      <tbody>
        <tr>{childBlocks?.map(renderCell)}</tr>
      </tbody>
    </table>
  );
};

export default GridBlock;
