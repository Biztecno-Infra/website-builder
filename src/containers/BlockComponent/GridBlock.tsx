import React from "react";
import { GridProps, GridBlockProps } from "../../types";
import GridCell from "./GridCell";
import { convertStringtoStyle } from "@utils/index";

const GridBlock: React.FC<GridBlockProps> = ({ block, isSelected }) => {
  const {
    columnGap,
    columns,
    backgroundColor = "transparent",
    childBlocks,
    customCss,
    backgroundImage, 
    backgroundPosition , 
    backgroundRepeat , 
    backgroundSize,
    ...rest
  } = block as GridProps;

  const convertedStyle = convertStringtoStyle(customCss);

  const backgroundImageStyle = backgroundImage
    ? {
      backgroundImage: backgroundImage.startsWith('url') 
      ? backgroundImage 
      : `url(${backgroundImage})`,
            backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};


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
      id={block.id}
      cellSpacing={columnGap || 0}
      style={{
        width: "100%",
        backgroundColor,
        maxWidth: "100%",
        tableLayout: "fixed",
        border: `1px dashed ${
          isSelected && block.parentId ? "#006E75" : "transparent"
        }`,
        ...convertedStyle,
        ...backgroundImageStyle, 
        ...rest,
      }}
    >
      <tbody>
        <tr>{childBlocks?.map(renderCell)}</tr>
      </tbody>
    </table>
  );
};

export default GridBlock;
