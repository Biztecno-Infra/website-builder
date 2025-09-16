import React from "react";
import { GridProps, GridBlockProps } from "../../types";
import GridCell from "./GridCell";
import { convertStringtoStyle } from "@utils/index";
import { ScreenViews } from "enum";
import { useBlockHook } from "@context/BlockContext";
import { useTheme } from "styled-components";

const GridBlock: React.FC<GridBlockProps> = ({
  block,
  isSelected,
}) => {
  const {
    columnGap,
    columns,
    backgroundColor = "transparent",
    childBlocks,
    customCss,
    backgroundImage,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    responsive,
    ...rest
  } = block as GridProps;
 const { selectedView} = useBlockHook();
   const theme = useTheme()
  const shouldStack = responsive === true && selectedView === ScreenViews.MOBILE;
  const convertedStyle = convertStringtoStyle(customCss);

  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition,
        backgroundRepeat,
        backgroundSize,
      }
    : {};

  const renderCell = (childBlock: string, index: number) => (
    <GridCell
      key={childBlock}
      blockId={childBlock}
      cellWidth={(block as GridProps)?.cellWidths?.[index] || 100 / columns}
    />
  );

  return (
    <table
      id={block.id}
      cellSpacing={columnGap || 0}
      style={{
        width: "100%",
        backgroundColor,
        maxWidth: "100%",
        tableLayout: "fixed",
        outline: `1px dashed ${
          isSelected && block.parentId ? theme.colors.primary : "transparent"
        }`,       
        ...convertedStyle,
        ...backgroundImageStyle,
        ...rest,
      }}
    >
      <tbody>
        {shouldStack ? (
          childBlocks?.map((blockId, index) => (
            <tr style={{padding: 0}} key={blockId}>{renderCell(blockId, index)}</tr>
          ))
        ) : (
          <tr style={{padding: 0}}>
            {childBlocks?.map((blockId, index) => renderCell(blockId, index))}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default GridBlock;
